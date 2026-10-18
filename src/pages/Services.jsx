import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Reveal from "../components/Reveal";
import usePageMeta from "../hooks/usePageMeta";
import useSiteContent from "../hooks/useSiteContent";
import { useTranslation } from "../context/LanguageContext";
import { pageTitle } from "../constants/brand";
import { getServicesFromContent } from "../utils/siteServices";
import "./Services.css";

function Services() {
  const { content } = useSiteContent();
  const { t, tObject } = useTranslation();
  const services = getServicesFromContent(content);

  usePageMeta(pageTitle(t("services.metaTitle")), t("services.metaDesc"));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal variant="fade">
            <span className="relay-line" />
            <h1 className="page__title">{t("services.title")}</h1>
            <p className="page__subtitle">{t("services.subtitle")}</p>
          </Reveal>
        </div>
      </section>

      <div className="page services-page">
        <div className="container">
          <div className="services-page__list">
            {services.map((service, index) => {
              const custom = service.custom;
              return (
                <article
                  key={service.id}
                  className={`service-row ${custom ? "service-row--custom" : ""}`}
                >
                  <span className="service-row__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="service-row__title">
                      {tObject(service, "title")}
                    </h2>
                    <p className="service-row__desc">
                      {tObject(service, "description")}
                    </p>
                  </div>
                  <Link
                    to={`/contact?service=${service.id}`}
                    className="service-row__link"
                  >
                    {custom ? <Sparkles size={16} /> : null}
                    {t("services.requestService")}
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Services;
