import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-temple-gradient p-8 text-center text-temple-cream">
      <span className="text-6xl text-temple-gold">ॐ</span>
      <p className="mt-6 font-serif text-lg text-temple-gold-soft lang-gu">
        || જય મા ચામુંડા ||
      </p>
      <h1 className="mt-2 font-display text-3xl lang-gu">
        માતાજીના ધામ તરફ પાછા ફરીએ
      </h1>
      <p className="mt-2 text-temple-cream/70">
        The page you are looking for could not be found.
      </p>
      <Link href="/" className="btn-gold mt-8 lang-gu">
        મુખ્ય પૃષ્ઠ
      </Link>
    </div>
  );
}
