import { BrandMark } from "../components/Brand";
import { ButtonLink, Eyebrow, Lines } from "../components/ui";

export default function NotFound() {
  return (
    <section className="container not-found">
      <div className="not-found-mark" aria-hidden="true">
        <BrandMark />
      </div>
      <Eyebrow>404 / Sahifa topilmadi</Eyebrow>
      <Lines as="h1">
        {[
          "Bu yo‘l hali",
          <span className="accent" key="a">
            ochilmagan.
          </span>,
        ]}
      </Lines>
      <p>Havola o‘zgargan yoki sahifa hali yaratilmagan bo‘lishi mumkin.</p>
      <ButtonLink to="/">Bosh sahifaga qaytish</ButtonLink>
    </section>
  );
}
