import { Component, OnInit } from '@angular/core';
import {Validators,FormGroup,FormBuilder,AbstractControl,ValidationErrors} from "@angular/forms";
import {Router} from '@angular/router'
import {AngularFireDatabase} from "angularfire2/database";
import { Observable } from 'rxjs/Observable';
import{map} from 'rxjs/operators/map';
import 'firebase/storage';
import * as firebase from 'firebase/app';
import { FirebaseApp } from 'angularfire2';
import {DropDownItemsService} from '../drop-down-items.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  providers: [DropDownItemsService]
})
export class RegistrationComponent implements OnInit {
  activeUserRole;
  storageRef;
  uploding=false;
  registrationForm:FormGroup;
  photo;
  total;
  roles;
  phoneList=[];
  autoInfo=[];
  footerError=false;
  picError=false;

  // table
  userInfoRef;
  addressRef;
  authRef;
  // preview profile  url
  url='./assets/img/add.png';
  
  // drop down source
  names=[];
  districts=[];
  bloodGroups=[];
  subDistricts=[];
  months=[];
  zones=[];

  //drop down suggestion
  filteredNames=[];
  filteredDistricts=[];
  filteredSubDistricts=[];
  filteredZone=[];
  
  get fullName() { return this.registrationForm.get('userInfo').get('fullName'); }

  get gender() { return this.registrationForm.get('userInfo').get('gender'); }

  get month() { return this.registrationForm.get('userInfo').get('month'); }

  get day() { return this.registrationForm.get('userInfo').get('day'); }

  get year() { return this.registrationForm.get('userInfo').get('year'); }

  get fatherName() { return this.registrationForm.get('userInfo').get('fatherName'); }

  get motherName() { return this.registrationForm.get('userInfo').get('motherName'); }

  get bloodGroup() { return this.registrationForm.get('userInfo').get('bloodGroup'); }

  get occupation() { return this.registrationForm.get('userInfo').get('occupation'); }

  get invitedBy() { return this.registrationForm.get('userInfo').get('invitedBy'); }

  get zone() { return this.registrationForm.get('address').get('zone'); }

  get subDistrict() { return this.registrationForm.get('address').get('subDistrict'); }

  get permanentAddress() { return this.registrationForm.get('address').get('permanentAddress'); }

  get district() {  return this.registrationForm.get('address').get('district');}

  get country() {  return this.registrationForm.get('address').get('country');}

  get nationality() {  return this.registrationForm.get('address').get('nationality');}

  get nId() { return this.registrationForm.get('address').get('nId'); }

  get userName() { return this.registrationForm.get('auth').get('userName'); }

  get password() { return this.registrationForm.get('auth').get('password'); }

  get conPassword() { return this.registrationForm.get('auth').get('conPassword'); }

  get phone() { return this.registrationForm.get('auth').get('phone');}

  get email() { return this.registrationForm.get('auth').get('email'); }

  get role() { return this.registrationForm.get('auth').get('role'); }


  constructor(private builder:FormBuilder,private db:AngularFireDatabase,private router:Router,private fb: FirebaseApp,private ddis:DropDownItemsService) {
    this.userInfoRef=this.db.database.ref("/userInfo");
    this.addressRef=this.db.database.ref('/address');
    this.authRef=this.db.database.ref('/auth');
    this.roles=this.ddis.getRoles();
    this.districts=this.ddis.getDistricts();
    this.subDistricts=this.ddis.getSubDistricts();
    this.zones=this.ddis.getZones();
    this.bloodGroups=this.ddis.getBloodGroups();
    this.months=this.ddis.getMonths();
   }

  ngOnInit() {
    this.activeUserRole=localStorage.getItem('activeUserRole');
    this.registrationForm=this.builder.group({
      userInfo:this.builder.group({
        photo:[""],
        fullName:["",Validators.required],
        gender:['',Validators.required],
        dob:[""],
        day:["",[Validators.required,Validators.pattern('^\\d+$')]],
        month:["",Validators.required],
        year:["",[Validators.required,Validators.pattern('^\\d+$')]],
        fatherName:["",Validators.required],
        motherName:["",Validators.required],
        invitedBy:["",Validators.required],
        occupation:["",Validators.required],
        bloodGroup:[''],
      }),
      address:this.builder.group({
        zone:["",[Validators.required,this.zoneDoesNotExixt.bind(this)]],
        subDistrict:["",Validators.required],
        permanentAddress:["",Validators.required],
        district:["",Validators.required],
        country:[""],
        nationality:[""],
        nId:["",Validators.pattern('^\\d+$')],
      }),
      auth:this.builder.group({
        userName:['',[this.existUserName.bind(this)]],
        password:["",Validators.required],
        conPassword:["",Validators.required],
        phone:["",[Validators.required,this.existPhone.bind(this),Validators.pattern('^\\d+$')]],
        role:['',Validators.required],
        email:['',[this.emailOrEmpty,this.existEmail.bind(this)]],
      },{
        validator:this.matchPassword
      })
    });

    // get user short list
    this.db.database.ref('short').on('value',snap=>{
      this.names=[];
      console.log(snap.val());
      let data=snap.val();
      if(data){
        Object.keys(data).forEach(key=>this.names.push(
          {
            name:data[key].fullName,
            zone:data[key].zone,
            subDistrict:data[key].subDistrict
          }
        ));
      // console.log(this.options);
      }
    });
    //get auth table
    this.authRef.once('value',snap=>{
      let data=snap.val();
      if(data){
        Object.keys(data).forEach(key=>{
          this.autoInfo.push(data[''+key])
        })
        console.log(this.autoInfo)
      }
    })

    this.db.database.ref('total').once('value')
    .then(snap=>{
      this.total=snap.val();
      // console.log(snap.val())
    });
  
  let userInfoGroup=<FormGroup>this.registrationForm.controls.userInfo;
  this.nameAutoSuggestion(userInfoGroup,'fatherName');
  this.nameAutoSuggestion(userInfoGroup,'motherName');
  this.nameAutoSuggestion(userInfoGroup,'invitedBy');

  let addressGroup=<FormGroup>this.registrationForm.controls.address;
  this.districtAutoSuggestion(addressGroup);
  this.subDistrictAutoSuggestion(addressGroup);
  this.zoneAutoSuggestion(addressGroup);

}

zoneDoesNotExixt(ac:AbstractControl):ValidationErrors | null{
  let data =this.zones.find(zone=>zone.toLowerCase().includes(ac.value.toLowerCase()));
  console.log(data);
  if(data){
    return null;
  }else{
    return {zoneDoesNotExixt:true}
  }
}

zoneAutoSuggestion(addressGroup:FormGroup){
  addressGroup.controls.zone.valueChanges
  .subscribe(val=>{
    if(!val){
      this.filteredZone=[];
    }else{
      this.filteredZone=this.zones.filter(option=>
        option.toLowerCase().includes(val.toLowerCase()))

    }
  })
}

districtAutoSuggestion(addressGroup:FormGroup){
  
  addressGroup.controls.district.valueChanges
  .subscribe(val=>{
    if(!val){
      this.filteredDistricts=[];
    }else{
      this.filteredDistricts=this.districts.filter(option=>option.toLowerCase().startsWith(val.toLowerCase()));
    }
  })

}

subDistrictAutoSuggestion(addressGroup:FormGroup){
  addressGroup.controls.subDistrict.valueChanges
  .subscribe(val=>{
    if(!val){
      this.filteredSubDistricts=[];
    }else{
      this.filteredSubDistricts=this.subDistricts.filter(option=>option.toLowerCase().startsWith(val.toLowerCase()));
    }
  })
}

nameAutoSuggestion(fg:FormGroup,controlName:string){
  fg.get(controlName).valueChanges
  .subscribe(val=>{
    if(!val){
      this.filteredNames=[];
    }else{
      this.filteredNames=this.names.filter(item =>
        item.name.toLowerCase().startsWith(val.toLowerCase()));
    } 
  });
}

   emailOrEmpty(control: AbstractControl): ValidationErrors | null {
    return control.value === '' ? null : Validators.email(control);
  }
  existPhone(control:AbstractControl):
  ValidationErrors | null{
    return control.value==='' ? null : this.existenceCheck(this.autoInfo,control,'phone')
  }

  existUserName(control:AbstractControl):
  ValidationErrors | null{
    return control.value==='' ? null : this.existenceCheck(this.autoInfo,control,'userName')
  }

  existEmail(control:AbstractControl):
  ValidationErrors | null{
    return control.value==='' ? null : this.existenceCheck(this.autoInfo,control,'email')
  }

  existenceCheck(list:any[],control:AbstractControl,fieldName){
    let error=null;
    list.forEach(val=>{
        if(val[fieldName].toString().startsWith(control.value)){
          // console.log('true');
          error={exist:true};
        }
    })
    
    return error;
  }

  readUrl(event:any) {
    this.url='./assets/img/add.png';
    this.photo=null;
    if (event.target.files && (event.target.files[0].type==='image/png' || event.target.files[0].type==='image/jpeg')) {
      this.picError=false;
      var reader = new FileReader();
  
      reader.onload = (event:any) => {
        this.url = event.target.result;
        // console.log(this.url.);
      }
      
      reader.readAsDataURL(event.target.files[0]);
      this.photo=event.target.files[0];
    }else{
      this.picError=true;
    }
  }

  matchPassword(ac:FormGroup){
    let password=ac.controls.password.value;
    let conPasswordCon=ac.controls.conPassword;
    if(password!=conPasswordCon.value){
      conPasswordCon.setErrors({missMatchPassword:true});
    }else{
      return null;
    }
    // console.log(password);
  }

  uploadPhoto2(key){
    let storageRef = this.fb.storage().ref('img/'+this.photo.name);
    var task=storageRef.put(this.photo);
    task.on('state_changed',
    snap=>
      console.log(snap)
      ,
  err=>console.log(err)
    ,()=>{
     // push to userinfo table
     this.db.database.ref('/users/'+key+'/userInfo').update({
      photo:task.snapshot.downloadURL
     });
     
})
  }

  
  uploadPhoto(userInfo){
    let storageRef = this.fb.storage().ref('img/'+this.photo.name);
        var task=storageRef.put(this.photo);
        task.on('state_changed',
        snap=>
          console.log(snap)
          ,
      err=>console.log(err)
        ,()=>{
         // push to userinfo table
         userInfo.photo=task.snapshot.downloadURL;
      console.log(task.snapshot.downloadURL);
      this.userInfoRef.push(userInfo);
      

    })
  }

  pushUserInfoTable():any{
    return this.db.database.ref('/users/').push({
      userInfo:{
      fullName:this.fullName.value,
      gender:this.gender.value,
      dob:this.day.value+'/'+this.month.value+'/'+this.year.value,
      fatherName:this.fatherName.value,
      motherName:this.motherName.value,
      invitedBy:this.invitedBy.value,
      bloodGroup:this.bloodGroup.value,
      occupation:this.occupation.value
      }
    }).key;
  }

  pushShortTable(key){
    this.db.database.ref('/short/'+key+'/').set({
      id:key,
      fullName:this.fullName.value,
      zone:this.zone.value,
      subDistrict:this.subDistrict.value
    })
  }

  pushAddressTable(key){
        // push to address table
        this.db.database.ref('/users/'+key+'/address').set({
          permanentAddress:this.permanentAddress.value,
          zone:this.zone.value,
          subDistrict:this.subDistrict.value,
          district:this.district.value,
          conutry:this.country.value,
          nationality:this.nationality.value,
          nId:this.nId.value,
        }
      );
  }

  pushAuthTable(key){
    this.db.database.ref('/auth/'+key).set({
      userName:this.userName.value,
      password:this.password.value,
      phone:this.phone.value,
      email:this.email.value,
      role:this.role.value,
    });
  }
  signup(){
    if(this.registrationForm.valid){
      this.uploding=true;
      let temp=this.registrationForm.controls.userInfo.value;
      let fg=<FormGroup>this.registrationForm.controls.userInfo;
      temp.dob=this.day.value+'/'+this.month.value+'/'+this.year.value;
   
          // console.log(temp);
      // push to address table
        this.addressRef.push(this.registrationForm.controls.address.value);
      // push to auth table
        console.log(this.registrationForm.controls.auth.value);
        if(this.photo){
          this.uploadPhoto(temp);
        }else{
          this.userInfoRef.push(temp);
        } 
        new Promise(resolve=>{
          
          let key=this.pushUserInfoTable();
          resolve(key)
        })
        .then(key=>{
          // console.log(key)
          this.pushAddressTable(key);
          this.pushAuthTable(key);
          this.pushShortTable(key);
          if(this.photo){
            this.uploadPhoto2(key)
          }

          this.db.database.ref('/').update({
            total:this.total+1
          });
        }).then(()=>{
          this.uploding=false;
          this.router.navigateByUrl('registration-sucessfull')
        })
        
    }else{
      Object.keys(this.registrationForm.controls).forEach(groupName=>{
        let formGroup=<FormGroup>this.registrationForm.get(groupName);
        // console.log()
        if(formGroup.controls){
          Object.keys(formGroup.controls).forEach(controlName=>
            formGroup.get(controlName).markAsTouched({onlySelf:true})
          )
        }
        
      })
      this.footerError=true;
    }
  
  }

}
