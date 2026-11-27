import { BrandMark } from "../components/Brand";
import { ButtonLink, Eyebrow, Lines } from "../components/ui";
import { tr } from "../lib/i18n";

export default function NotFound() {
  return (
    <section className="container not-found">
      <div className="not-found-mark" aria-hidden="true">
        <BrandMark size="l" />
      </div>
      <Eyebrow>404</Eyebrow>
      <Lines as="h1">
        {[
          tr("Sahifa"),
          <span className="accent" key="a">
            {tr("topilmadi.")}
          </span>,
        ]}
      </Lines>
      <p>{tr("Havola o‘zgargan yoki sahifa hali yaratilmagan bo‘lishi mumkin.")}</p>
      <ButtonLink to="/">{tr("Bosh sahifaga qaytish")}</ButtonLink>
    </section>
  );
}
