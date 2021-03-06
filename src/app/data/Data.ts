import {HttpClient,HttpHeaders} from "@angular/common/http";
import { User } from "../model/User";
import { Subscribable } from "rxjs/Observable";

// main endpoint
const endPoing='http://localhost:9000/api/'

// dedug endpoint

// const endPoing='http://localhost:52426/api/'

export class Data{

 
    private httpOptions={
        headers:new HttpHeaders({'Content-Type':'application/json'})
    }

    private http;

    constructor(http:HttpClient){this.http=http}

    insertUser(user:User):Subscribable<boolean>{

        let url=endPoing+"insertUser";

       return this.http.post(url,user,this.httpOptions)
       
    }

    getUsersByPage(pageNumber):Subscribable<any>{

        let url=endPoing+"getUsersByPage/"+pageNumber;

       return this.http.get(url,this.httpOptions)
       
    }


    
    getUserById(id):Subscribable<any>{

        let url=endPoing+"getUserById/"+id;

       return this.http.get(url,this.httpOptions)
       
    }

    edirUser(user):Subscribable<any>{

        let url=endPoing+"editUser";

       return this.http.put(url,user,this.httpOptions);
       
    }
}