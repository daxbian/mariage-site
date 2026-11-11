const CONFIG = {
  dateMariage: "2026-03-27T14:30:00",
  endpointFormulaire: "https://formspree.io/f/VOTRE_ID_FORMSPREE",
  lienCagnotte: "https://VOTRE-LIEN-CAGNOTTE.example",
};

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initCompteARebours();
  initCarrousel();
  initFormulaire();
  initCagnotte();
});

function initMenu() {
  const burger = document.querySelector(".burger");
  const liens = document.querySelector(".nav-liens");
  if (!burger || !liens) return;

  burger.addEventListener("click", () => {
    const ouvert = liens.classList.toggle("ouvert");
    burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
  });

  liens.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => liens.classList.remove("ouvert"))
  );
}

function initCompteARebours() {
  const bloc = document.getElementById("compte-a-rebours");
  if (!bloc) return;

  const cible = new Date(CONFIG.dateMariage).getTime();

  function maj() {
    const reste = cible - Date.now();
    if (reste <= 0) {
      bloc.innerHTML = "<div><strong>🎉</strong><small>C'est aujourd'hui !</small></div>";
      return;
    }
    const s = Math.floor(reste / 1000);
    document.getElementById("c-jours").textContent = Math.floor(s / 86400);
    document.getElementById("c-heures").textContent = Math.floor((s % 86400) / 3600);
    document.getElementById("c-minutes").textContent = Math.floor((s % 3600) / 60);
    document.getElementById("c-secondes").textContent = s % 60;
  }

  maj();
  setInterval(maj, 1000);
}

function initCarrousel() {
  const carrousel = document.getElementById("carrousel-hotels");
  if (!carrousel) return;

  const piste = carrousel.querySelector(".carrousel-piste");
  const cartes = carrousel.querySelectorAll(".hotel-carte");
  const points = carrousel.querySelector(".carrousel-points");
  const precedent = carrousel.querySelector(".precedent");
  const suivant = carrousel.querySelector(".suivant");
  let index = 0;

  cartes.forEach((_, i) => {
    const point = document.createElement("button");
    point.setAttribute("aria-label", "Hôtel " + (i + 1));
    point.addEventListener("click", () => aller(i));
    points.appendChild(point);
  });

  function aller(i) {
    index = (i + cartes.length) % cartes.length;
    piste.style.transform = "translateX(-" + index * 100 + "%)";
    points.querySelectorAll("button").forEach((p, j) =>
      p.classList.toggle("actif", j === index)
    );
  }

  precedent.addEventListener("click", () => aller(index - 1));
  suivant.addEventListener("click", () => aller(index + 1));

  let debutX = null;
  carrousel.addEventListener("touchstart", (e) => (debutX = e.touches[0].clientX), { passive: true });
  carrousel.addEventListener("touchend", (e) => {
    if (debutX === null) return;
    const delta = e.changedTouches[0].clientX - debutX;
    if (Math.abs(delta) > 50) aller(index + (delta < 0 ? 1 : -1));
    debutX = null;
  });

  aller(0);
}

function initFormulaire() {
  const formulaire = document.getElementById("formulaire-rsvp");
  if (!formulaire) return;

  const statut = document.getElementById("formulaire-statut");
  const blocAccompagnants = document.getElementById("bloc-accompagnants");
  const blocEnfants = document.getElementById("bloc-enfants");

  formulaire.querySelectorAll('input[name="accompagne"]').forEach((radio) =>
    radio.addEventListener("change", () =>
      blocAccompagnants.classList.toggle("visible", radio.value === "Accompagné(e)" && radio.checked)
    )
  );

  formulaire.querySelectorAll('input[name="enfants"]').forEach((radio) =>
    radio.addEventListener("change", () =>
      blocEnfants.classList.toggle("visible", radio.value === "Oui" && radio.checked)
    )
  );

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    statut.className = "formulaire-statut";
    statut.textContent = "Envoi en cours…";

    if (!formulaire.checkValidity()) {
      statut.className = "formulaire-statut erreur";
      statut.textContent = "Merci de remplir les champs obligatoires (nom, email, venue).";
      return;
    }

    const donnees = Object.fromEntries(new FormData(formulaire).entries());
    donnees.moments = formulaire
      .querySelectorAll('input[name="moments"]:checked')
      .map((c) => c.value)
      .join(", ");

    try {
      const reponse = await fetch(CONFIG.endpointFormulaire, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(donnees),
      });
      if (!reponse.ok) throw new Error("Erreur " + reponse.status);
      statut.className = "formulaire-statut succes";
      statut.textContent = "Merci ! Votre réponse a bien été envoyée, un email de confirmation vous attend. 💌";
      formulaire.reset();
      blocAccompagnants.classList.remove("visible");
      blocEnfants.classList.remove("visible");
    } catch {
      statut.className = "formulaire-statut erreur";
      statut.innerHTML =
        "L'envoi automatique a échoué. " +
        '<a href="' + lienMailto(donnees) + '">Cliquez ici pour envoyer votre réponse par email</a>.';
    }
  });
}

function lienMailto(donnees) {
  const corps = Object.entries(donnees)
    .map(([cle, valeur]) => cle + " : " + valeur)
    .join("\n");
  return (
    "mailto:VOTRE.EMAIL@example.com?subject=" +
    encodeURIComponent("Réponse au questionnaire de mariage") +
    "&body=" +
    encodeURIComponent(corps)
  );
}

function initCagnotte() {
  const lien = document.getElementById("lien-cagnotte");
  if (lien && CONFIG.lienCagnotte && !CONFIG.lienCagnotte.includes("example")) {
    lien.href = CONFIG.lienCagnotte;
  }
}
