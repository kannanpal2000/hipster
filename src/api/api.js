import axios from "axios";
import logger from "../utils/logger";

const BASE = "https://dev.natureland.hipster-virtual.com/api/v1";
export let authToken = localStorage.getItem("authToken") || null;
export let loggedInUser = null;

/* ── Axios instance ─────────────────────────────────────────────────────── */
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(
  (config) => {
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      logger.warn("API", "Unauthorized – token expired");
      authToken = null;
      localStorage.removeItem("authToken");
    }
    logger.error("API", "Response error", err.message);
    return Promise.reject(err);
  }
);

/* ── Login ─────────────────────────────────────────────────────────────── */
export async function apiLogin() {
  try {
    const fd = new FormData();
    fd.append("email",    "react@hipster-inc.com");
    fd.append("password", "React@123");
    fd.append("key_pass", "07ba959153fe7eec778361bf42079439");
    const res  = await axios.post(`${BASE}/login`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const body = res.data?.data;
    authToken    = body?.data?.token?.token;
    loggedInUser = body?.data?.user || null;
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      logger.info("API", "Login OK");
    }
    return !!authToken;
  } catch (err) {
    logger.warn("API", "Login failed, using demo mode", err.message);
    return false;
  }
}

/* ── Generic call ───────────────────────────────────────────────────────── */
export async function apiCall(method, path, body = null, params = null) {
  try {
    const response = await api({ method, url: path, data: body, params });
    return response?.data;
  } catch (err) {
    logger.warn("API", `${method} ${path} failed`, err.message);
    throw err;
  }
}

/* ── Bookings ───────────────────────────────────────────────────────────── */
export async function fetchBookings(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const apiDate   = `${d}-${m}-${y}`;
  const res = await api.get("/bookings/outlet/booking/list", {
    params: { pagination: 1, daterange: `${apiDate} / ${apiDate}`, outlet: 1, panel: "outlet", view_type: "calendar", per_page: 500 },
  });
  console.log("bookings",res);
  
  return res?.data?.data?.list?.bookings;
}

export async function createBooking(payload) {
  const fd = new FormData();
  fd.append("company", 1); fd.append("outlet", 1); fd.append("outlet_type", 2);
  fd.append("booking_type", 1); fd.append("panel", "outlet");
  fd.append("customer", payload.customer);
  fd.append("service_at", payload.service_at);
  fd.append("created_by",229061)
  fd.append("membership", 0)
  // created_by:229061,membership:0
  if (payload.source)     fd.append("source",     payload.source);
  if (payload.note)       fd.append("note",       payload.note);
  // if (payload.membership) fd.append("membership", payload.membership);
  fd.append("items", JSON.stringify(payload.items));
  return await api.post("/bookings/create", fd);
}

export async function editBooking(bookingId, payload) {
  const fd = new FormData();
  fd.append("company", 1); fd.append("outlet", 1); fd.append("panel", "outlet");
  fd.append("customer",   payload.customer);
  fd.append("service_at", payload.service_at);
  fd.append("booking_type",1);
  if (payload.source)     fd.append("source",     payload.source);
  if (payload.note)       fd.append("note",       payload.note);
  if (payload.membership !== undefined) fd.append("membership", payload.membership);
  if (loggedInUser?.id)   fd.append("updated_by", loggedInUser.id);
  fd.append("items", JSON.stringify(payload.items));
  return await api.post(`/bookings/${bookingId}`, fd);
}

export async function updateBookingStatus(bookingId, status) {
  const fd = new FormData();
  fd.append("company", 1); fd.append("id", bookingId);
  fd.append("status", status); fd.append("panel", "outlet"); fd.append("outlet_type", 2);
  return await api.post("/bookings/update/payment-status", fd);
}

export async function cancelBookingItem(bookingId, type = "normal") {
  const fd = new FormData();
  fd.append("company", 1); fd.append("id", bookingId);
  fd.append("type", type); fd.append("panel", "outlet");
  return await api.post("/bookings/item/cancel", fd);
}

export async function deleteBooking(bookingId) {
  return await api.delete(`/bookings/destroy/${bookingId}`);
}

/* ── Therapists ─────────────────────────────────────────────────────────── */
export async function fetchTherapists() {
  const res = await api.get("/therapists", {
    params: { pagination: 0, outlet: 1, panel: "outlet", outlet_type: 2, status: 1 },
  });
  console.log("therapistsres",res);
  
  const list = res?.data?.data?.list?.staffs;
  if (Array.isArray(list))           return list;
  if (list?.therapists)              return list.therapists;
  if (Array.isArray(res?.data))      return res.data;
  return [];
}

/* ── Services ───────────────────────────────────────────────────────────── */
export async function fetchServices() {
  const res = await api.get("/service-category", {
    params: { pagination: 0, outlet: 1, panel: "outlet", status: 1 },
  });
  console.log("services",res);
  
  const list = res?.data?.data?.list?.category;
  if (Array.isArray(list)) return list.flatMap((c) => Array.isArray(c.services) ? c.services : [c]);
  if (list?.service_categories) return list.service_categories.flatMap((c) => Array.isArray(c.services) ? c.services : [c]);
  if (Array.isArray(res?.data))  return res.data;
  return [];
}

/* ── Rooms ──────────────────────────────────────────────────────────────── */
export async function fetchRooms(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const res = await api.get("/room-bookings/outlet/1", {
    params: { date: `${d}-${m}-${y}`, panel: "outlet", pagination: 0 },
  });
  console.log("rooms",res);
  
  const list = res?.data;
  if (Array.isArray(list))       return list;
  if (list?.rooms)               return list.rooms;
  if (Array.isArray(res?.data))  return res.data;
  return [];
}

/* ── Users / Clients ────────────────────────────────────────────────────── */
export async function fetchUsers(page = 1) {
  const res = await api.get("/users", { params: { pagination: 1, page } });
  const list = res?.data?.data?.list?.users;
  console.log("users",list);
  
  if (list)               return list;
  if (Array.isArray(res?.data))  return res.data;
  return [];
}
