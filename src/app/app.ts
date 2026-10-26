import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { Book, BookService } from "./services/book.service";
import { AuthService } from "./services/auth.service";
import { CartItem, CartService } from "./services/cart.service";
import { OrderService } from "./services/order.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'online-bookstore-ui';
   books: Book[] = [];
   errorMessage = '';
   userName = '';
   password = '';
   authMessage = '';
   isLoggedIn = false;
   loggedInUserId: number | null = null; // Store the logged-in user's ID
   cartItems: CartItem[] = [];
   cartMessage = '';
   isAuthLoading = false;
   orders: any[] = [];
   orderMessage = '';
   isPlaceOrderLoading = false;

  constructor(private bookService: BookService,
        private authService: AuthService,
        private cartService: CartService,
        private orderService: OrderService,
        private changeDetectorRef: ChangeDetectorRef
  ) { }
   
  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
    },
    error: (error) => {
        console.error('Error fetching books:', error);
        this.errorMessage = 'Failed to load books. Please try again later.';
      }
    });
  }

register(): void {
  this.isAuthLoading = true;
  this.authMessage = 'Registering...';

  this.authService.register(this.userName, this.password)
    .pipe(
      finalize(() => {
        this.isAuthLoading = false;
        this.changeDetectorRef.markForCheck();
      })
    )
    .subscribe({
      next: (message) => {
        this.authMessage =
          message || 'Registration successful. You can now log in.';
          this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.authMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Registration failed. Please try again.';
      }
    });
}

login(): void {
  this.isAuthLoading = true;
  this.authMessage = 'Logging in...';

  this.authService.login(this.userName, this.password)
    .pipe(
      finalize(() => {
        this.isAuthLoading = false;
        this.changeDetectorRef.markForCheck();
      })
    )
    .subscribe({
      next: (response) => {
        this.authMessage = response.message;
        this.changeDetectorRef.markForCheck();
        this.isLoggedIn = true;
        this.loggedInUserId = response.userId;
        this.loadBooks();
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoggedIn = false;
        this.loggedInUserId = null;
        this.authMessage =
          typeof error.error === 'string'
            ? error.error
            : 'Login failed. Please try again.';
        this.changeDetectorRef.markForCheck();
      }
    });
}

  addToCart(book: Book): void {
  if (!this.isLoggedIn || this.loggedInUserId === null){
    this.cartMessage = 'Please log in again.';
    return;
  }

  const quantity = book.quantityToAdd ?? 1;

  if (!Number.isInteger(quantity) || quantity < 1) {
    this.cartMessage = 'Please enter a valid quantity.';
    return;
  }

  if (quantity > book.booksAvailable) {
    this.cartMessage = 'Requested quantity exceeds available stock.';
    return;
  }

  const userId = this.loggedInUserId;

  this.cartService.addItemToCart({
    userId,
    bookId: book.id,
    bookQuantity: quantity
  }).subscribe({
    next: (message) => {
      this.cartMessage = message || 'Book added to cart successfully!';
      this.loadCartItems();
    },
    error: (error) => {
      console.error('Add to cart failed:', error);
      this.cartMessage =
        typeof error.error === 'string'
          ? error.error
          : 'Unable to add book to cart.';
    }
  });
}

loadCartItems(): void {
  if (!this.isLoggedIn || this.loggedInUserId === null) {
    this.cartMessage = 'Please log in to view your cart.';
    return;
  }

  this.cartService.getCart(this.loggedInUserId).subscribe({
    next: (items) => {
      this.cartItems = items;
      this.cartMessage = '';
    },
    error: (error) => {
      console.error('Failed to load cart items:', error);
      this.cartMessage = 'Failed to load cart items.';
    }
  });
}

get cartTotal(): number {
  return this.cartItems.reduce((total, item) => total + (item.bookPrice * item.bookQuantity), 0);
  }

loadOrders(): void {
  if (!this.isLoggedIn || this.loggedInUserId === null) {
    return
  }

  this.orderService.getOrders(this.loggedInUserId).subscribe({
    next: (orders) => {
      this.orders = orders;
    },
    error: (error) => {
      console.error('Failed to load orders:', error);
    }
  });
}

placeOrder(): void {
  if (!this.isLoggedIn || this.loggedInUserId === null) {
    this.orderMessage = 'Please log in to place an order.';
    return;
  }

  if(this.cartItems.length === 0) {
    this.orderMessage = 'Your cart is empty. Please add items to your cart before placing an order.';
    return;
  }

  this.orderMessage = 'Placing order...';
  this.isPlaceOrderLoading = true; 

  this.orderService.placeOrder(this.loggedInUserId)
  .pipe(
    finalize(() => {
      this.isPlaceOrderLoading = false;
      this.changeDetectorRef.markForCheck();
    })
  )
  .subscribe({
    next: (response) => {
      this.orderMessage = 'Order placed successfully!';
      this.loadCartItems(); // Clear the cart after placing the order
      this.loadBooks(); // Refresh the book list to update available stock
      this.loadOrders();
    },
    error: (error) => {
      console.error('Failed to place order:', error);
      this.orderMessage = typeof error.error === 'string'
        ? error.error
        : 'Failed to place order. Please try again.';
    }
  });
}

}