import { BrandMark } from "../components/Brand";
import { ButtonLink, Eyebrow, Lines } from "../components/ui";

export default function NotFound() {
  return (
    <section className="container not-found">
      <div className="not-found-mark" aria-hidden="true">
        <BrandMark size="l" />
      </div>
      <Eyebrow>404</Eyebrow>
      <Lines as="h1">
        {[
          "Sahifa",
          <span className="accent" key="a">
            topilmadi.
          </span>,
        ]}
      </Lines>
      <p>Havola o‘zgargan yoki sahifa hali yaratilmagan bo‘lishi mumkin.</p>
      <ButtonLink to="/">Bosh sahifaga qaytish</ButtonLink>
    </section>
  );
}
