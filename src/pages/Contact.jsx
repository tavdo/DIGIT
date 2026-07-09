import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, Phone, Mail, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";

import Reveal from "../components/Reveal";
import usePageMeta from "../hooks/usePageMeta";
import { pageTitle } from "../constants/brand";
import useSiteContent from "../hooks/useSiteContent";
import { createTicket, ORDER_PRIORITY } from "../services/orderService";
import {
  MAX_ORDER_DESCRIPTION_LENGTH,
  validateMessageLength,
} from "../utils/validation";
import { validateTicketAttachmentSelection } from "../utils/attachmentValidation";
import TicketAttachmentPicker from "../components/TicketAttachmentPicker";
import "./Contact.css";

function Contact() {
  const { t, tObject } = useTranslation();

  usePageMeta(pageTitle(t("contact.metaTitle")), t("contact.metaDesc"));

  const { user, userProfile } = useAuth();
  const { content } = useSiteContent();
  const navigate = useNavigate();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [priority, setPriority] = useState(ORDER_PRIORITY.FLEXIBLE);
  const [description, setDescription] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [success, setSuccess] = useState(false);

  const enabledServices = content?.services?.filter((s) => s.enabled) || [];

  useEffect(() => {
    if (content?.services) {
      const enabled = content.services.filter((s) => s.enabled);
      const param = new URLSearchParams(window.location.search).get("service");
      if (param && enabled.some((s) => s.id === param)) {
        setSelectedServiceId(param);
      } else if (enabled.length > 0 && !selectedServiceId) {
        setSelectedServiceId(enabled[0].id);
      }
    }
  }, [content, selectedServiceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = description.trim();
    const lengthError = validateMessageLength(
      trimmed,
      MAX_ORDER_DESCRIPTION_LENGTH,
    );

    if (!user || !trimmed || lengthError) {
      if (lengthError) setError(lengthError);
      return;
    }

    const filesError = validateTicketAttachmentSelection(attachmentFiles);
    if (filesError) {
      setAttachmentError(filesError);
      return;
    }

    setSubmitting(true);
    setError("");
    setAttachmentError("");

    const selectedService = content?.services?.find(
      (s) => s.id === selectedServiceId,
    );
    const serviceType = selectedService
      ? tObject(selectedService, "title") || selectedService.title
      : "General Problem";
    const managerId = selectedService?.managerId || null;
    const managerName = selectedService?.managerName || null;

    try {
      await createTicket({
        customerId: user.uid,
        customerName:
          userProfile?.name ||
          user.displayName ||
          user.email?.split("@")[0] ||
          t("roles.customer"),
        serviceId: selectedServiceId || null,
        serviceType,
        description: trimmed,
        priority,
        attachmentFiles,
        managerId,
        managerName,
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-requests"), 1500);
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <Reveal>
            <h1 className="page-hero__title">{t("contact.title")}</h1>
            <p className="page-hero__text">{t("contact.subtitle")}</p>
          </Reveal>
        </div>
      </section>

      <div className="page contact-page">
        <div className="container">
          {success ? (
            <div className="ticket-success">
              <h2>{t("contact.successTitle")}</h2>
              <p>{t("contact.successSubtitle")}</p>
              <Link to="/my-requests" className="btn btn--primary">
                {t("contact.myRequestsBtn")}
              </Link>
            </div>
          ) : (
            <div className="ticket-layout">
              <form className="ticket-form" onSubmit={handleSubmit} noValidate>
                {error && <div className="contact-page__error">{error}</div>}

                <div className="ticket-form__field">
                  <label
                    htmlFor="ticket-service"
                    className="ticket-form__label"
                  >
                    {t("contact.serviceLabel") || "სერვისის კატეგორია"}
                  </label>
                  <select
                    id="ticket-service"
                    className="ticket-form__select"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={submitting}
                  >
                    {enabledServices.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {tObject(srv, "title")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ticket-form__field">
                  <span className="ticket-form__label">
                    {t("contact.priorityLabel") || "პრიორიტეტი"}
                  </span>
                  <div className="ticket-priority">
                    <button
                      type="button"
                      className={`ticket-priority__btn ${
                        priority === ORDER_PRIORITY.URGENT
                          ? "ticket-priority__btn--active ticket-priority__btn--urgent"
                          : ""
                      }`}
                      onClick={() => setPriority(ORDER_PRIORITY.URGENT)}
                      disabled={submitting}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#ff3333",
                          borderRadius: "50%",
                        }}
                      />
                      {t("contact.priorityUrgent") || "სასწრაფო (დღესვე)"}
                    </button>
                    <button
                      type="button"
                      className={`ticket-priority__btn ${
                        priority === ORDER_PRIORITY.TOMORROW
                          ? "ticket-priority__btn--active ticket-priority__btn--tomorrow"
                          : ""
                      }`}
                      onClick={() => setPriority(ORDER_PRIORITY.TOMORROW)}
                      disabled={submitting}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#ffaa00",
                          borderRadius: "50%",
                        }}
                      />
                      {t("contact.priorityTomorrow") || "ხვალისთვის"}
                    </button>
                    <button
                      type="button"
                      className={`ticket-priority__btn ${
                        priority === ORDER_PRIORITY.FLEXIBLE
                          ? "ticket-priority__btn--active ticket-priority__btn--flexible"
                          : ""
                      }`}
                      onClick={() => setPriority(ORDER_PRIORITY.FLEXIBLE)}
                      disabled={submitting}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#00ff88",
                          borderRadius: "50%",
                        }}
                      />
                      {t("contact.priorityFlexible") || "შეიძლება დაელოდოს"}
                    </button>
                  </div>
                </div>

                <div className="ticket-form__field">
                  <label
                    htmlFor="ticket-description"
                    className="ticket-form__label"
                  >
                    {t("contact.descriptionLabel")}
                  </label>
                  <textarea
                    id="ticket-description"
                    className="ticket-form__textarea"
                    rows={6}
                    placeholder={t("contact.placeholderDesc")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                    required
                    maxLength={MAX_ORDER_DESCRIPTION_LENGTH}
                  />
                </div>

                <TicketAttachmentPicker
                  files={attachmentFiles}
                  onChange={setAttachmentFiles}
                  disabled={submitting}
                  error={attachmentError}
                />

                <button
                  type="submit"
                  className="btn btn--primary btn--lg ticket-form__submit"
                  disabled={submitting || !description.trim()}
                >
                  <Send size={18} />
                  {submitting
                    ? attachmentFiles.length > 0
                      ? t("contact.uploading")
                      : t("contact.sending")
                    : t("contact.submitBtn")}
                </button>
              </form>

              <aside className="contact-info">
                <h2 className="contact-info__title">
                  {t("contact.otherContact")}
                </h2>
                <ul className="contact-info__list">
                  <li>
                    <Phone size={18} aria-hidden="true" />
                    <div>
                      <span className="contact-info__label">
                        {t("contact.phone")}
                      </span>
                      <a
                        href={`tel:${content.contactPhone.replace(/\s/g, "")}`}
                      >
                        {content.contactPhone}
                      </a>
                    </div>
                  </li>
                  <li>
                    <Mail size={18} aria-hidden="true" />
                    <div>
                      <span className="contact-info__label">
                        {t("contact.email")}
                      </span>
                      <a href={`mailto:${content.contactEmail}`}>
                        {content.contactEmail}
                      </a>
                    </div>
                  </li>
                  <li>
                    <Clock size={18} aria-hidden="true" />
                    <div>
                      <span className="contact-info__label">
                        {t("contact.workingHours")}
                      </span>
                      <span>{tObject(content, "workingHours")}</span>
                    </div>
                  </li>
                </ul>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Contact;
