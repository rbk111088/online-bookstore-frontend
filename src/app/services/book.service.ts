import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Book {
    id: number;
    bookTitle: string;
    bookAuthor: string;
    bookPrice: number;
    booksAvailable: number;
    quantityToAdd?: number; // Optional property for quantity to add to cart
}

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private apiUrl = 'http://localhost:8081/api/v1/books';

    constructor(private http: HttpClient) { }

    getBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(this.apiUrl);
    }
}