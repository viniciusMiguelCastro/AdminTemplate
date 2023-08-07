import Head from 'next/head'
import Image from 'next/image'
import loadingImage from '../../../public/images/loading.gif'
import useAuth from '../../data/hook/UseAuth'
import router from 'next/router'

export default function ForcarAutenticacao(props) {
    const { usuario, loading } = useAuth()

    function renderizarConteudo() {
        return (
            <>
                <Head>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `if(!document.cookie.includes("admin-template-auth")){
                                window.location.href = "/autenticacao"
                            }
                            `
                        }}
                    />
                </Head>
                {props.children}
            </>
        )
    }

    function RenderizarCarregando() {
        return (
            <div className={`
                flex justify-center items-center h-screen
            `}>
                <Image src={loadingImage} alt='Img de carregamento' />
            </div>
        )
    }

    if (!loading && usuario?.email) {
        return renderizarConteudo()
    }
    else if (loading) {
        renderizarConteudo()
    }
    else {
        router.push('/autenticacao')
        return null
    }

}