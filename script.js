const { createClient } = window.supabase;

const SUPABASE_URL = "YOUR_API_URL";https://vzfjibildbxqarcxatom.supabase.co/rest/v1/
const SUPABASE_KEY = "YOUR_NEW_PUBLISHABLE_KEY";sb_publishable_d1t_-U4G_R4_hzw3HIU9lg_aNwUeU7P

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GOAL = 50;

const form = document.getElementById("petitionForm");
const count = document.getElementById("count");
const list = document.getElementById("signatureList");
const message = document.getElementById("message");
const progress = document.getElementById("progress");

function safe(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

async function render() {
  const { data: signatures, error } =
    await supabase.rpc("get_public_signatures");

  const { data: total, error: countError } =
    await supabase.rpc("get_signature_count");

  if (error || countError) {
    console.error(error || countError);
    return;
  }

  const n = Number(total);

  count.textContent = n.toLocaleString();
  progress.style.width = Math.min(n / GOAL * 100, 100) + "%";

  list.innerHTML = n
    ? signatures.map(x =>
        `<div class="signature">${safe(x.name)}</div>`
      ).join("")
    : '<p class="empty">No signatures yet. Be the first!</p>';
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const period = Number(document.getElementById("period").value);
  const isPublic = document.getElementById("public").checked;

  if (!name || !period) return;

  const { error } = await supabase
    .from("signatures")
    .insert({
      name: isPublic ? name : "Anonymous supporter",
      period: period
    });

  if (error) {
    console.error(error);
    message.textContent = "Something went wrong. Please try again.";
    return;
  }

  form.reset();
  document.getElementById("public").checked = true;

  message.textContent = "Thanks — your signature was added!";
  await render();

  setTimeout(() => {
    message.textContent = "";
  }, 3000);
});

render();
