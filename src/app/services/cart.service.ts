import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Food } from '../shared/models/food';
import { HttpClient } from '@angular/common/http';
import { CART_ADD, CART_DELETE, CART_QUANTITY, CART_URL } from '../shared/constants/urls';
import { getUserFromLocalStorage, setHeaders } from '../shared/auth/authen';

const USER_ID = "userId"

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<any>(null);
  public cartObservable: Observable<any>;

  constructor(private http: HttpClient) { 
    this.cartObservable = this.cartSubject.asObservable();
    const accessToken = getUserFromLocalStorage();
    if(accessToken){
      this.getCart().subscribe((data) => {
          this.cartSubject.next(data); 
      })
    }
  }

  addToCart(food: Food): void {
    const accessToken = getUserFromLocalStorage();
    const clientId = localStorage.getItem(USER_ID);
    
    if (!accessToken || !clientId) {
      console.log("error AT & CLID");
      return;
    } else {
      const parseClientId = JSON.parse(clientId);
      const data_cart = {
        userId: parseClientId,
        food: {
          foodId: food._id,
          quantity: 1,
          name: food.name,
          img: food.imageUrl,
          price: food.price
        }
      };
      const headers = setHeaders(accessToken, parseClientId);
  
      this.http.post<any>(CART_ADD, data_cart, { headers }).subscribe(
        (data) => {
          this.getCart().subscribe((data) => {
            this.cartSubject.next(data); 
          })
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
    }
  }

  changeQuantity(food: any, quantity: number): Observable<any> {    
    let parseClientId;
    const accessToken = getUserFromLocalStorage();
    const clientId = localStorage.getItem(USER_ID);
    if (clientId !== null) {
      parseClientId = JSON.parse(clientId);
    }
    const headers = setHeaders(accessToken, parseClientId);
    
    const data = {
      userId: parseClientId,
      user_order_ids: [
        {
          item_foods: [
              {
                  quantity: quantity,
                  price: food.price,
                  old_quantity: food.quantity,
                  foodId: food.foodId
              }
          ]
      }
      ]
    };

    return this.http.post<any>(CART_QUANTITY, data, { headers }).pipe(
      tap({
        next: (data) => {
          this.getCart().subscribe((data) => {
            this.cartSubject.next(data); 
          })
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
        }
      })
    );
  }

  getCart(): Observable<any> {
    let parseClientId;
    const accessToken = getUserFromLocalStorage();
    const clientId = localStorage.getItem(USER_ID);
    if (clientId !== null) {
      parseClientId = JSON.parse(clientId);
    }
    const headers = setHeaders(accessToken, parseClientId);

    return this.http.get<any>( CART_URL, { headers }).pipe(
      tap({
        next: (data) => {
          let totalCount =0 , totalPrice = 0;
          for (let index = 0; index < data?.metadata?.cart_foods.length; index++) {
            totalCount = totalCount + data?.metadata?.cart_foods[index].quantity;
            totalPrice = totalPrice + (data?.metadata?.cart_foods[index].quantity * data?.metadata?.cart_foods[index].price);
          }
          data.totalCount = totalCount;
          data.totalPrice = totalPrice;
          this.cartSubject.next(data);
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
        } 
      })
    );
  }

  removeFormCart(foodId: string): Observable<any> {
    let parseClientId;
    const accessToken = getUserFromLocalStorage();
    const clientId = localStorage.getItem(USER_ID);
    if (clientId !== null) {
      parseClientId = JSON.parse(clientId);
    }
    const headers = setHeaders(accessToken, parseClientId);

    return this.http.get<any>(`${CART_DELETE}/${foodId}`, { headers }).pipe(
      tap({
        next: (data) => {
          this.getCart().subscribe((data) => {
            this.cartSubject.next(data); 
          })
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
        }
      })
    );
  }
}
