import { createContext, useEffect, useState } from "react";
import firebase from "../../firebase/config";
import Usuario from "@/model/Usuario";
import route from "next/router";
import Cookies from 'js-cookie';

interface AuthContextProps {
    usuario?: Usuario,
    loading?: boolean,
    login?: (email: string, senha: string) => Promise<void>
    cadastrar?: (email: string, senha: string) => Promise<void>
    loginGoogle?: () => Promise<void>
    logout?: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({})

async function usuarioNormalizado(usuarioFirebase: firebase.User): Promise<Usuario> {
    const token = await usuarioFirebase.getIdToken()
    return {
        uid: usuarioFirebase.uid,
        name: usuarioFirebase.displayName,
        email: usuarioFirebase.email,
        token: token,
        provider: usuarioFirebase.providerData[0]?.providerId,
        imageUrl: usuarioFirebase.photoURL
    }
}

async function gerenciarCookie(logado: any) {
    if (logado) {
        Cookies.set('admin-template-auth', logado, {
            expires: 7
        })
    }
    else {
        Cookies.remove('admin-template-auth')
    }
}

export function AuthProvider(props: any) {
    const [loading, setLoading] = useState(true)
    const [usuario, setUsuario] = useState<Usuario | null>(null)

    async function configurarSesssao(usuarioFirebase) {
        if (usuarioFirebase?.email) {
            const usuario = await usuarioNormalizado(usuarioFirebase)
            setUsuario(usuario)
            gerenciarCookie(true)
            setLoading(false)
            return usuario.email
        }
        else {
            setUsuario(null)
            gerenciarCookie(false)
            setLoading(false)
            return false
        }
    }

    async function login(email, senha) {
        try {
            setLoading(true)
            const resp = await firebase.auth().signInWithEmailAndPassword(email, senha)

            await configurarSesssao(resp.user)
            route.push('/')
        }
        finally {
            setLoading(false)
        }
    }

    async function cadastrar(email, senha) {
        try {
            setLoading(true)
            const resp = await firebase.auth().createUserWithEmailAndPassword(email, senha)

            await configurarSesssao(resp.user)
            route.push('/')
        }
        finally {
            setLoading(false)
        }
    }

    async function loginGoogle() {
        try {
            setLoading(true)
            const resp = await firebase.auth().signInWithPopup(
                new firebase.auth.GoogleAuthProvider()
            )

            await configurarSesssao(resp.user)
            route.push('/')
        }
        finally {
            setLoading(false)
        }
    }

    async function logout() {
        try {
            setLoading(true)
            await firebase.auth().signOut()
            await configurarSesssao(null)
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (Cookies.get('admin-template-auth')) {
            const cancelar = firebase.auth().onIdTokenChanged(configurarSesssao)
            return () => cancelar()
        }
        else {
            setLoading(false)
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            usuario,
            loading,
            login,
            cadastrar,
            loginGoogle,
            logout
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContext