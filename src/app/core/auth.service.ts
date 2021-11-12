import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap, mergeMap } from 'rxjs/operators';

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  favoriteColor?: string;
  role: string;
}

@Injectable(
  { providedIn: 'root' }
)
export class AuthService {
  user: Observable<User | null | undefined>;

  token: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
  ) {

    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users_admin/${user.uid}`).valueChanges()
        } else {
          return of(null)
        }
      })
    )
  }

  doLogin(value:any) {
    return this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)
      .then((res: { user: any; }) => {
        this.updateUserData(res.user)
      })
  }

  private updateUserData(user: { uid: any; email: any; displayName: any; photoURL: any; }) {
    // Sets user data to firestore on login

    //this.requestPermission();

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users_admin/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: "administrador"
    }

    return userRef.set(data, { merge: true })

  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}