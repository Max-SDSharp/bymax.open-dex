export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-3 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span className="text-center md:text-left w-full md:w-auto block">
          © {new Date().getFullYear()} Bymax OpenDEX.
        </span>
        <div className="flex gap-3 mt-1 md:mt-0 flex-wrap justify-center md:justify-end w-full md:w-auto">
          <a href="/privacidade" className="hover:underline whitespace-nowrap">
            Privacy Policy
          </a>
          <a href="/termos" className="hover:underline whitespace-nowrap">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  )
}
