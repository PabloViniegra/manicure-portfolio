import { useState, useEffect, useRef } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    let ctx;
    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default;
      import("gsap/ScrollTrigger").then((pluginModule) => {
        gsap.registerPlugin(pluginModule.ScrollTrigger);
        if (formRef.current) {
          formRef.current.classList.remove("form-gsap-init");
          ctx = gsap.context(() => {
            gsap.from(formRef.current, {
              opacity: 0,
              filter: "blur(10px)",
              y: 50,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: formRef.current,
                start: "top 85%",
                toggleActions: "play none none reset",
              },
            });
          }, formRef);
        }
      });
    });

    return () => ctx && ctx.revert();
  }, []);

  useEffect(() => {
    if (status) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setSending(true);

    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus("¡Mensaje enviado con éxito!");
        form.reset();
      } else {
        setStatus(result?.error || "Error al enviar el mensaje.");
      }
    } catch (err) {
      setStatus("No se pudo conectar al servidor.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form
        className="space-y-6 text-left form-gsap-init"
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={formRef}
      >
        <input
          type="text"
          name="name"
          placeholder="Tu nombre"
          className="w-full px-5 py-3 rounded-2xl bg-white text-dark placeholder-gray-500 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Tu email"
          className="w-full px-5 py-3 rounded-2xl bg-white text-dark placeholder-gray-500 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          required
        />
        <textarea
          name="message"
          placeholder="Escribe tu mensaje..."
          className="w-full px-5 py-3 rounded-2xl bg-white text-dark placeholder-gray-500 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition resize-none"
          rows={5}
          required
        />
        <div className="text-center">
          <button
            type="submit"
            disabled={sending}
            className="bg-fuchsia-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-fuchsia-400 hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-fuchsia-400"
          >
            {sending ? "Enviando..." : "Enviar mensaje"}
          </button>
        </div>
      </form>
      {showToast && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg text-white font-semibold text-lg animate-fade-in-up transition-all duration-300
            ${status.startsWith("¡Mensaje") ? "bg-green-500" : "bg-red-500"}`}
          style={{ minWidth: 280, maxWidth: 400 }}
        >
          {status.startsWith("¡Mensaje") ? (
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span>{status}</span>
        </div>
      )}
    </>
  );
}
