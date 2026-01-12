import { ItemService } from './../../services/item.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl,FormGroup,FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-itemcreate',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, ReactiveFormsModule],
  templateUrl: './itemcreate.component.html',
  styleUrl: './itemcreate.component.scss'
})
export class ItemcreateComponent implements OnInit {
    private itemService = inject(ItemService);

      items: any = [];
   userid: string | null = null;

    constructor(
      private router: Router,
      private route : ActivatedRoute
    ) {}

      profileForm = new FormGroup({
    name: new FormControl('' , [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z]+$/)


    ]),

        quantity : new FormControl(null,[
        Validators.required,
        Validators.max(5),
        ]),


    price: new FormControl(null,[
        Validators.required,
        Validators.min(15),
        Validators.max(100),



    ]),
    category : new FormControl('',[
       Validators.required,
        Validators.max(250),
    Validators.pattern('^[A-Za-z]+\\s[A-Za-z]+$')

    ]),

})

  ngOnInit() : void{

      this.userid = this.route.snapshot.paramMap.get('id');
    if(this.userid){
        this.itemService.getitembyid(this.userid).subscribe({
          next: (data) =>{
            console.log("Items are : " , data);
            this.items = data;
            this.profileForm.patchValue(this.items);
          },
          error: (error) => {
            console.error("Error in fetching items :" , error);
          }
        });
      }
      else{
        this.userid=null;
        this.profileForm.reset();
      }

   }
   message ='';

    submitted = false;

//    onCreate() {
//   this.submitted = true;

//   if (this.profileForm.invalid) {
//     return;
//   }
//          const formValue = this.profileForm.value;
//          const item = {
//            name: formValue.name || '',
//            price: formValue.price || 0,
//            quantity: formValue.quantity || 0,
//            category: formValue.category || '',

//          };
//          console.log('Creating item:', item);

//       this.itemService.createitems(this.items).subscribe({
//         next:(Response) => {
//           this.message= "Item Created Successfully";
//           this.profileForm.reset();
//           this.router.navigate(['/']);
//         },
//         error:(error) => {
//             this.message = "Error creating item";
//                 console.error('Error:', error);
//         }

//     });
//   }
// onUpdate(id : string, items : string ){
//         this.itemService.updateitem(this.items, this.userid!).subscribe({
//           next: (data) =>{
//             console.log("Items updated successfully",data);
//             this.items = data;
//           this.router.navigate(['/']);

//           },
//           error: (error) => {
//             console.error("Error in fetching items :", error);
//           }
//         })
//     }

// onSubmit(){
//   if(!this.userid){
//     this.onCreate();
// }
// else{
//    this.onUpdate(this.userid,this.items);
// }
// }



    onSubmit(){

  this.submitted = true;

  if (this.profileForm.invalid) {
    return;
  }
      this.items=this.profileForm.value;

        if (this.userid) {
          this.itemService.updateitem(this.items,this.userid).subscribe(() => {

            this.router.navigate(['/inventory/all']);
          });
        } else {
          this.itemService.createitems(this.items).subscribe(() => {
            this.router.navigate(['/inventory/all']);
          });
        }
      }


}


