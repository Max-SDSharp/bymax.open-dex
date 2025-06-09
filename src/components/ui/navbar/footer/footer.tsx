export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-4 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          © {new Date().getFullYear()} Bymax OpenDEX. Todos os direitos
          reservados.
        </span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/privacidade" className="hover:underline">
            Política de Privacidade
          </a>
          <a href="/termos" className="hover:underline">
            Termos de Uso
          </a>
        </div>
      </div>
    </footer>
  )
}
