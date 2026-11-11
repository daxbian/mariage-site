const CONFIG = {
  dateMariage: "2026-03-27T14:30:00",
  endpointFormulaire: "https://formspree.io/f/VOTRE_ID_FORMSPREE",
  emailDestinataire: "VOTRE.EMAIL@example.com",
  lienCagnotte: "https://VOTRE-LIEN-CAGNOTTE.example",
};

function endpointConfigure() {
  return CONFIG.endpointFormulaire && !CONFIG.endpointFormulaire.includes("VOTRE_ID_FORMSPREE");
}

function emailConfigure() {
  return CONFIG.emailDestinataire && !CONFIG.emailDestinataire.includes("example.com");
}

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
      const message = bloc.dataset.messageFin || "C'est aujourd'hui !";
      bloc.innerHTML = "<div><strong>🎉</strong><small>" + message + "</small></div>";
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
      blocAccompagnants.classList.toggle("visible", radio.dataset.apri === "1" && radio.checked)
    )
  );

  formulaire.querySelectorAll('input[name="enfants"]').forEach((radio) =>
    radio.addEventListener("change", () =>
      blocEnfants.classList.toggle("visible", radio.dataset.apri === "1" && radio.checked)
    )
  );

  formulaire.addEventListener("submit", async (e) => {
    e.preventDefault();
    statut.className = "formulaire-statut";
    statut.textContent = formulaire.dataset.envoi || "Envoi en cours…";

    if (!formulaire.checkValidity()) {
      statut.className = "formulaire-statut erreur";
      statut.textContent =
        formulaire.dataset.messageValidation ||
        "Merci de remplir les champs obligatoires (nom, email, venue).";
      return;
    }

    const donnees = collecterDonnees(formulaire);

    if (!endpointConfigure()) {
      ouvrirMailto(formulaire, donnees);
      statut.className = "formulaire-statut succes";
      statut.innerHTML =
        (formulaire.dataset.mailtoOk ||
          "Votre logiciel email vient de s'ouvrir avec votre réponse pré-remplie : il ne reste qu'à l'envoyer. Si rien ne s'est ouvert, ") +
        '<a href="' + lienMailto(formulaire, donnees) + '">' +
        (formulaire.dataset.lienMailto || "cliquez ici") + "</a>.";
      return;
    }

    try {
      const reponse = await fetch(CONFIG.endpointFormulaire, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(donnees),
      });
      if (!reponse.ok) throw new Error("Erreur " + reponse.status);
      statut.className = "formulaire-statut succes";
      statut.textContent =
        formulaire.dataset.succes ||
        "Merci ! Votre réponse a bien été envoyée, un email de confirmation vous attend. 💌";
      reinitialiserFormulaire(formulaire);
    } catch {
      ouvrirMailto(formulaire, donnees);
      statut.className = "formulaire-statut erreur";
      statut.innerHTML =
        (formulaire.dataset.mailtoErreur ||
          "L'envoi automatique a échoué : votre logiciel email s'est ouvert avec votre réponse pré-remplie. Si rien ne s'est ouvert, ") +
        '<a href="' + lienMailto(formulaire, donnees) + '">' +
        (formulaire.dataset.lienMailto || "cliquez ici") + "</a>.";
    }
  });
}

function collecterDonnees(formulaire) {
  const donnees = Object.fromEntries(new FormData(formulaire).entries());
  donnees.moments = formulaire
    .querySelectorAll('input[name="moments"]:checked')
    .map((c) => c.value)
    .join(", ");
  return donnees;
}

function reinitialiserFormulaire(formulaire) {
  formulaire.reset();
  document.getElementById("bloc-accompagnants")?.classList.remove("visible");
  document.getElementById("bloc-enfants")?.classList.remove("visible");
}

function ouvrirMailto(formulaire, donnees) {
  window.location.href = lienMailto(formulaire, donnees);
}

function lienMailto(formulaire, donnees) {
  const libelles = {
    nom: "Nom & prénom",
    email: "Email",
    accompagne: "Vient",
    accompagnants: "Accompagnant(s)",
    enfants: "Enfants",
    ages_enfants: "Prénoms et âges des enfants",
    moments: "Moments présents",
    allergies: "Allergies / régime",
    commentaires: "Commentaires",
  };
  const corps = Object.entries(donnees)
    .filter(([, valeur]) => valeur)
    .map(([cle, valeur]) => (libelles[cle] || cle) + " : " + valeur)
    .join("\n");
  const sujet = formulaire.dataset.sujetEmail || "Réponse au questionnaire de mariage";
  return (
    "mailto:" + CONFIG.emailDestinataire +
    "?subject=" + encodeURIComponent(sujet + " — " + (donnees.nom || "")) +
    "&body=" + encodeURIComponent(corps)
  );
}

function initCagnotte() {
  const lien = document.getElementById("lien-cagnotte");
  if (lien && CONFIG.lienCagnotte && !CONFIG.lienCagnotte.includes("example")) {
    lien.href = CONFIG.lienCagnotte;
  }
}
