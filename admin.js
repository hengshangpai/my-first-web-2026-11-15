import { supabase, isConfigured } from "./supabase.js";

const els = {
  alert: document.getElementById("alert"),
  loginPanel: document.getElementById("login-panel"),
  dashboard: document.getElementById("dashboard"),
  userEmail: document.getElementById("user-email"),
  loginForm: document.getElementById("login-form"),
  loginBtn: document.getElementById("login-btn"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  logoutBtn: document.getElementById("logout-btn"),
  timelineForm: document.getElementById("timeline-form"),
  saveBtn: document.getElementById("save-btn"),
  date: document.getElementById("date"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  tags: document.getElementById("tags"),
};

function setAlert(message, type = "error") {
  els.alert.hidden = !message;
  els.alert.textContent = message ?? "";
  els.alert.className = `alert ${type}`;
}

function render(session) {
  const signedIn = Boolean(session);
  els.loginPanel.hidden = signedIn;
  els.dashboard.hidden = !signedIn;
  els.userEmail.textContent = session?.user?.email ?? "";
  if (!signedIn) setAlert("");
}

function parseTags(value) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function signIn(event) {
  event.preventDefault();
  els.loginBtn.disabled = true;
  els.loginBtn.textContent = "登录中…";
  setAlert("");

  const { error } = await supabase.auth.signInWithPassword({
    email: els.email.value.trim(),
    password: els.password.value,
  });

  els.loginBtn.disabled = false;
  els.loginBtn.textContent = "登录";

  if (error) {
    setAlert(`登录失败：${error.message}`);
    return;
  }

  els.loginForm.reset();
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) setAlert(`退出失败：${error.message}`);
}

async function saveTimeline(event) {
  event.preventDefault();
  els.saveBtn.disabled = true;
  els.saveBtn.textContent = "保存中…";
  setAlert("");

  const payload = {
    date: els.date.value,
    title: els.title.value.trim(),
    description: els.description.value.trim() || null,
    tags: parseTags(els.tags.value),
  };

  const { error } = await supabase.from("timeline").insert(payload);

  els.saveBtn.disabled = false;
  els.saveBtn.textContent = "保存到 timeline";

  if (error) {
    setAlert(`保存失败：${error.message}`);
    return;
  }

  els.timelineForm.reset();
  setAlert("保存成功，1.5 秒后返回首页…", "ok");
  setTimeout(() => {
    window.location.href = "./index.html";
  }, 1500);
}

if (!isConfigured) {
  setAlert("尚未配置 Supabase：请打开 config.js 填入 Project URL 与 publishable key。");
  els.loginBtn.disabled = true;
} else {
  els.loginForm.addEventListener("submit", signIn);
  els.logoutBtn.addEventListener("click", signOut);
  els.timelineForm.addEventListener("submit", saveTimeline);

  // 恢复已登录状态（刷新页面后不用重新输入密码）
  supabase.auth.getSession().then(({ data: { session } }) => render(session));
  supabase.auth.onAuthStateChange((_event, session) => render(session));
}