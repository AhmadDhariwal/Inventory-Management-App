import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { Inventory } from '../../../model/inventory';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { signup } from '../../../model/signup';
import { login } from '../../../model/login';
import { HttpHeaders } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ItemService {



    http = inject(HttpClient);
    private apiurl = `http://localhost:3000/items`;
    private signupurl = `http://localhost:3000/user`;


  constructor(private router: Router) { }


private getAuthHeaders() {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
}
isadmin(): boolean {
  const role = localStorage.getItem('role');
  return role === 'admin';
}


isAuthenticated() : boolean{

  const  t = localStorage.getItem('token') !== null;
  return t;
  }

logout(): void {
        localStorage.removeItem('token');
         localStorage.removeItem('role');
       this.router.navigate(['/login']);

      }

usersignup(item: signup) {
  return this.http.post<signup>(this.signupurl, item).pipe(
    tap((res:any) => {

      localStorage.setItem('token', res.token);
       localStorage.setItem('role', res.item.role);
    }),
    catchError(err => {
      console.error('User Signup Error:', err);
      return throwError(() => err);
    })
  );
}

  userlogin(item : login){
    const url = `${this.signupurl}/login`;
    return this.http.post<login>(url, item,{
        headers: this.getAuthHeaders()
    }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.item.role);
      }),
     catchError(err => {
        console.error('User Login error : ', err);
        return throwError(()=> err);
     })
    );
 }
 getusers(){
  const url = `${this.apiurl}/allusers`;
    return this.http.get<Inventory>(url,{
        headers: this.getAuthHeaders()
    }).pipe(
     catchError(err => {
        console.error('Get users error : ', err);
        return throwError(()=> err);
     })
    );
 }


 createitems(item : Inventory) {

    return this.http.post<Inventory>(this.apiurl,item,{
        headers: this.getAuthHeaders()

    }).pipe(
    catchError(err => {
      console.error('Create item error : ', err);
      return throwError(()=> err);
    })
  );
 }

//  createitems(item : Inventory) {

//     const params = new HttpParams()
//       .set("page", page)
//       .set("limit", limit);
//      return this.http.post<any>(this.apiurl, { params }).pipe(
//     catchError(err => {
//       console.error('Create item error : ', err);
//       return throwError(()=> err);
//     })
//   );
//  }

 getitem(page :number , limit:number , search : string='' ) {
  const url = `${this.apiurl}?page=${page}&limit=${limit}&search=${search}`;
  return this.http.get<Inventory>(url,{
      headers: this.getAuthHeaders()
  }).pipe(
  catchError(err => {
    console.error("Get items err : ",err);
    return throwError(() => err);
  })
 );
}

 getitembyid(id: string) {
   const url = `${this.apiurl}/${id}`;
    return this.http.get<Inventory>(url,{
        headers: this.getAuthHeaders()

    }).pipe(
     catchError(err => {
      console.error("Get item by id error : ",err);
      return throwError(() => err);
     })
    );
}
 updateitem(item: Inventory,id:string) {                           //id: string, updateData: Partial<Inventory>
     const url = `${this.apiurl}/${id}`;
     return this.http.put<Inventory>(url,item,{
        headers: this.getAuthHeaders()

     }).pipe(       //    return this.http.put<Inventory>(url, updateData).pipe(

      catchError(err => {
        console.error("Update item error", err);
        return throwError(() => err);
      })
     );
  }

  deleteitem(id : string){
     const url = `${this.apiurl}/${id}`;
     return this.http.delete<Inventory>(url,{
        headers: this.getAuthHeaders()

     }).pipe(
      catchError(err => {
        console.error("Delete Item Error : ", err);
         return throwError(() => err);
      })
     );
  }
}


