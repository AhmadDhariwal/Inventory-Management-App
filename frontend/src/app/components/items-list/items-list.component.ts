import { ItemService } from './../../services/item.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime,distinctUntilChanged,switchMap } from 'rxjs';
import { Pipe } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent implements OnInit{
 private ItemService = inject(ItemService);
  private router = inject(Router);
    searchControl = new FormControl('');


itemToDelete: any = null;
showDeleteConfirmation: boolean = false;


 items: any[] = [];
 currentpage = 1;
 totalitems = 0;
 limit=10;




  array =[];

//  get filteredItems() {
//    if (!this.searchTerm) return this.items;
//    return this.items.filter(item =>
//      item.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
//      item.category?.toLowerCase().includes(this.searchTerm.toLowerCase())
//    );
//  }

// get filteredItems() {
//   return this.items;
// }


  waitsearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.onSearch();
      });
  }

 onSearch() {
  this.currentpage = 1;
  this.loadItems();
}


   ngOnInit(): void {
      this.loadItems();
      this.waitsearch();
   }
   loadItems(){

   console.log("Onload");
   this.ItemService.getitem(this.currentpage , this.limit, this.searchControl.value || '').subscribe
   ({
    next: (data : any) =>{
     // console.log("Items are :", data );
      this.items= data.items;
      this.totalitems = data.total;

    },
    error:(error) => {
      console.error("Error in fetching items :", error);
    }

   });

}
//  updateAndMoveToFirst(updatedItem: any): void {
//     const index = this.items.findIndex(item => item.id === updatedItem.id);

//     if (index !== -1) {
//       this.items.splice(index, 1);

//       this.items.unshift(updatedItem);

//
//       // this.items = [...this.items];
//     }
//   }


confirmDelete(item:any){

  this.itemToDelete = item;
  this.loadItems();
}
cancelDelete(){
  this.itemToDelete = null;
  this.showDeleteConfirmation = false;
}
deleteItem(id: string) {
  this.ItemService.deleteitem(id).subscribe({
    next: () => {
      this.showDeleteConfirmation = false;
      this.itemToDelete = null;

      if (this.items.length === 1 && this.currentpage > 1) {
       this.currentpage--;
      }

      this.loadItems();
    },
    error: (err) => {
      console.error('Error deleting item', err);
    }
  });
}


nextPage()
{
   if(this.currentpage * this.limit <this.totalitems){
    this.currentpage++;
    this.loadItems();
   }
}
prevPage()
{
   if(this.currentpage > 1){
    this.currentpage--;
    this.loadItems();
   }
}
}
