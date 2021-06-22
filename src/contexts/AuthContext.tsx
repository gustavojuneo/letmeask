import { createContext, ReactNode, useState, useEffect } from 'react';
import { firebase, auth } from '../services/firebase';

type UserDTO = {
  id: string;
  name: string;
  avatar: string;
};

type AuthContextProps = {
  user: UserDTO | undefined;
  signInWithGoogle: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDTO>();

  function saveUser(user: firebase.User) {
    const { displayName, photoURL, uid } = user;

    if (!displayName || !photoURL) {
      throw new Error('Missing information from Google Account.');
    }

    setUser({
      id: uid,
      name: displayName,
      avatar: photoURL,
    });
  }

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      saveUser(result.user);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => user && saveUser(user));

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
