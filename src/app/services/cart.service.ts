import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface CartItem {
    id: number;
    userId: number;
    bookId: number;
    bookTitle: string;
    bookPrice: number;
    booksAvailable: number;
    bookQuantity: number;
}

export interface AddItemRequest {
    userId: number;
    bookId: number;
    bookQuantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = 'http://localhost:8081/api/v1/cart';

    constructor(private http: HttpClient) { }

    getCart(userId: number): Observable<CartItem[]> {   
        return this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`,
            { withCredentials: true }
        );
    }

    addItemToCart(request: AddItemRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/add`, request, {
            responseType: 'text',
            withCredentials: true
       });
    }
}