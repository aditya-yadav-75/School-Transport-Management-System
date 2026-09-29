import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptyRoute = {
  routeName: "",
  vehicleNumber: "",
  driverName: "",
  driverPhone: "",
  vehicleCapacity: "",
  active: true,
  pickupPoints: [{ name: "", address: "", order: 1 }]
};

const emptyChild = {
  name: "",
  rollNumber: "",
  className: "",
  phone: ""
};

function getInitialTheme() {
  return localStorage.getItem("routeflow_theme") || "system";
}

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(
    () => localStorage.getItem("routeflow_active_child") || ""
  );

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      root.dataset.theme = theme === "system" ? "" : theme;

      root.style.colorScheme =
        theme === "light"
          ? "light"
          : theme === "dark"
          ? "dark"
          : "light dark";
    };

    applyTheme();
    localStorage.setItem("routeflow_theme", theme);

    if (theme !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => applyTheme();

    media.addEventListener?.("change", onChange);

    return () =>
      media.removeEventListener?.("change", onChange);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("transport_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("transport_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role !== "parent") {
      setChildren([]);
      return;
    }

    api("/auth/children")
      .then((data) => {
        setChildren(data);

        setActiveChildId((current) => {
          const exists = data.some(
            (child) => child._id === current
          );

          const next = exists
            ? current
            : data[0]?._id || "";

          if (next) {
            localStorage.setItem(
              "routeflow_active_child",
              next
            );
          } else {
            localStorage.removeItem(
              "routeflow_active_child"
            );
          }

          return next;
        });
      })
      .catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(
      () => setMessage(""),
      2800
    );

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!error) return undefined;

    const timer = setTimeout(
      () => setError(""),
      4200
    );

    return () => clearTimeout(timer);
  }, [error]);

  const activeChild = useMemo(
    () =>
      children.find(
        (child) => child._id === activeChildId
      ) ||
      children[0] ||
      null,
    [children, activeChildId]
  );

  const switchChild = (id) => {
    setActiveChildId(id);

    localStorage.setItem(
      "routeflow_active_child",
      id
    );

    setPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("transport_token");
    localStorage.removeItem("routeflow_active_child");

    setUser(null);
    setChildren([]);
    setActiveChildId("");
    setPage("dashboard");
  };

  const login = (data) => {
    localStorage.setItem(
      "transport_token",
      data.token
    );

    setUser(data.user);
    setPage("dashboard");
  };

  const addChild = async (childForm) => {
    const child = await api("/auth/children", {
      method: "POST",
      body: JSON.stringify(childForm)
    });

    setChildren((current) => [
      ...current,
      child
    ]);

    setActiveChildId(child._id);

    localStorage.setItem(
      "routeflow_active_child",
      child._id
    );

    setPage("dashboard");

    setMessage(
      `${child.name} was added to your family.`
    );
  };

  if (loading) {
    return (
      <div className="center-screen">
        Loading RouteFlow...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        error={error}
        setError={setError}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  const isAdmin = user.role === "admin";
  const isParent = user.role === "parent";
  const isStudent = user.role === "student";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-row">
            <div className="brand-mark">R</div>

            <div>
              <div className="brand">
                Route<span>Flow</span>
              </div>

              <p className="brand-sub">
                School Transport
              </p>
            </div>
          </div>

          {isParent && (
            <ChildSwitcher
              children={children}
              activeChild={activeChild}
              onSwitch={switchChild}
              onAdd={() => setPage("children")}
            />
          )}
        </div>

        <nav className="nav-list">
          <NavButton
            label="Overview"
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          />

          <NavButton
            label="Routes"
            active={page === "routes"}
            onClick={() => setPage("routes")}
          />

          {isAdmin && (
            <>
              <NavButton
                label="Students"
                active={page === "students"}
                onClick={() => setPage("students")}
              />

              <NavButton
                label="Assignments"
                active={page === "assignments"}
                onClick={() => setPage("assignments")}
              />

              <NavButton
                label="Drivers"
                active={page === "drivers"}
                onClick={() => setPage("drivers")}
              />
            </>
          )}

          {isParent && (
            <>
              <NavButton
                label="Children"
                active={page === "children"}
                onClick={() => setPage("children")}
              />

              <NavButton
                label="Transport"
                active={page === "my-assignment"}
                onClick={() =>
                  setPage("my-assignment")
                }
              />
            </>
          )}

          {isStudent && (
            <NavButton
              label="My Transport"
              active={page === "my-assignment"}
              onClick={() =>
                setPage("my-assignment")
              }
            />
          )}
        </nav>

        <div className="sidebar-bottom">
          <ThemeControl
            theme={theme}
            setTheme={setTheme}
          />

          <div className="account-card">
            <div className="avatar">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="account-copy">
              <strong>{user.name}</strong>

              <span>
                {isAdmin
                  ? "Transport admin"
                  : isParent
                  ? "Parent account"
                  : "Student account"}
              </span>
            </div>
          </div>

          <button
            className="logout"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        {message && (
          <div className="toast success">
            {message}
          </div>
        )}

        {error && (
          <div className="toast error">
            {error}
          </div>
        )}

        {page === "dashboard" && (
          <Dashboard
            user={user}
            activeChild={activeChild}
            children={children}
          />
        )}

        {page === "routes" && (
          <RoutesPage
            user={user}
            notify={setMessage}
            fail={setError}
          />
        )}

        {page === "students" && isAdmin && (
          <StudentsPage fail={setError} />
        )}

        {page === "assignments" && isAdmin && (
          <AssignmentsPage fail={setError} />
        )}

        {page === "drivers" && isAdmin && (
          <DriversPage
            user={user}
            notify={setMessage}
            fail={setError}
          />
        )}

        {page === "children" && isParent && (
          <ChildrenPage
            children={children}
            activeChildId={activeChild?._id}
            onSwitch={switchChild}
            onAdd={addChild}
            fail={setError}
          />
        )}

        {page === "my-assignment" &&
          (isParent || isStudent) && (
            <MyAssignmentPage
              fail={setError}
              studentId={
                isParent
                  ? activeChild?._id
                  : null
              }
              student={
                isParent
                  ? activeChild
                  : null
              }
              isParent={isParent}
            />
          )}
      </main>
    </div>
  );
}

function AuthScreen({
  onLogin,
  error,
  setError,
  theme,
  setTheme
}) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    className: "",
    phone: ""
  });

  const isParent = mode === "parent-register";
  const isRegister = mode !== "login";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const body = {
        ...form,
        accountType: isParent
          ? "parent"
          : "student"
      };

      const data = await api(
        mode === "login"
          ? "/auth/login"
          : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );

      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-topbar">
        <div className="brand-row">
          <div className="brand-mark">R</div>

          <div className="brand">
            Route<span>Flow</span>
          </div>
        </div>

        <ThemeControl
          theme={theme}
          setTheme={setTheme}
          compact
        />
      </div>

      <div className="auth-layout">
        <div className="auth-intro">
          <span className="eyebrow">
            SCHOOL TRANSPORT
          </span>

          <h1>
            Everything your family needs for the
            school commute.
          </h1>

          <p>
            Keep routes, pickup points and student
            transport details in one quiet, simple
            place.
          </p>

          <div className="intro-points">
            <span>Live route information</span>
            <span>
              One account for multiple children
            </span>
            <span>Simple parent switching</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">
              WELCOME
            </span>

            <h2>
              {mode === "login"
                ? "Sign in"
                : isParent
                ? "Create parent account"
                : "Create student account"}
            </h2>

            <p>
              {mode === "login"
                ? "Use your RouteFlow account to continue."
                : isParent
                ? "Add all your children from one account."
                : "Create an account for one student."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={
                mode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => setMode("login")}
            >
              Sign in
            </button>

            <button
              className={
                mode === "parent-register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() =>
                setMode("parent-register")
              }
            >
              Parent
            </button>

            <button
              className={
                mode === "student-register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() =>
                setMode("student-register")
              }
            >
              Student
            </button>
          </div>

          <form onSubmit={submit}>
            {isRegister && (
              <>
                <label>
                  Name

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                    }
                    placeholder={
                      isParent
                        ? "Parent name"
                        : "Student name"
                    }
                  />
                </label>

                {mode === "student-register" && (
                  <div className="form-two">
                    <label>
                      Roll number

                      <input
                        required
                        value={form.rollNumber}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            rollNumber:
                              e.target.value
                          })
                        }
                      />
                    </label>

                    <label>
                      Class

                      <input
                        required
                        value={form.className}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            className:
                              e.target.value
                          })
                        }
                      />
                    </label>
                  </div>
                )}

                {mode === "student-register" && (
                  <label>
                    Phone

                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value
                        })
                      }
                    />
                  </label>
                )}
              </>
            )}

            <label>
              Email

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password

              <input
                type="password"
                required
                minLength="6"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
                placeholder="At least 6 characters"
              />
            </label>

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <button
              className="primary full"
              type="submit"
            >
              {mode === "login"
                ? "Continue"
                : isParent
                ? "Create parent account"
                : "Create student account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ThemeControl({
  theme,
  setTheme,
  compact = false
}) {
  return (
    <div
      className={
        compact
          ? "theme-control compact"
          : "theme-control"
      }
    >
      <span className="theme-label">
        Appearance
      </span>

      <div className="theme-segmented">
        {[
          ["system", "System"],
          ["light", "Light"],
          ["dark", "Dark"]
        ].map(([value, label]) => (
          <button
            key={value}
            className={
              theme === value
                ? "selected"
                : ""
            }
            onClick={() =>
              setTheme(value)
            }
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChildSwitcher({
  children,
  activeChild,
  onSwitch,
  onAdd
}) {
  return (
    <div className="child-switcher">
      <div className="switcher-label">
        Viewing
      </div>

      <select
        value={activeChild?._id || ""}
        onChange={(e) =>
          onSwitch(e.target.value)
        }
      >
        {!children.length && (
          <option value="">
            No children yet
          </option>
        )}

        {children.map((child) => (
          <option
            key={child._id}
            value={child._id}
          >
            {child.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="switcher-add"
        onClick={onAdd}
      >
        + Add child
      </button>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick
}) {
  return (
    <button
      className={
        active ? "nav active" : "nav"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  activeChild,
  children
}) {
  const isParent = user.role === "parent";
  const isAdmin = user.role === "admin";

  const subject = isParent
    ? activeChild?.name || "your children"
    : user.name;

  const [stats, setStats] = useState({
    buses: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    vacantSeats: 0,
    totalCapacity: 0,
    occupiedSeats: 0,
    students: 0,
    parents: 0,
    assignments: 0,
    drivers: 0,
    availableDrivers: 0,
    assignedDrivers: 0,
    vacantDriverRoutes: 0,
    routeDetails: [],
    loading: isAdmin
  });

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;

    const loadStats = async () => {
      try {
        const [
          routes,
          students,
          assignments,
          drivers
        ] = await Promise.all([
          api("/routes"),
          api("/students"),
          api("/assignments"),
          api("/drivers").catch(() => [])
        ]);

        const activeRoutes = routes.filter(
          (route) => route.active !== false
        );

        const busNumbers = new Set(
          activeRoutes
            .map(
              (route) =>
                route.vehicleNumber
            )
            .filter(Boolean)
        );

        const totalCapacity =
          activeRoutes.reduce(
            (total, route) =>
              total +
              Number(
                route.vehicleCapacity || 0
              ),
            0
          );

        const occupiedSeats =
          activeRoutes.reduce(
            (total, route) =>
              total +
              Number(
                route.assignedCount || 0
              ),
            0
          );

        const vacantSeats = Math.max(
          0,
          totalCapacity - occupiedSeats
        );

        const parentIds = new Set(
          students
            .map((student) => {
              if (!student.parent)
                return null;

              return typeof student.parent ===
                "object"
                ? student.parent._id ||
                    student.parent.id
                : student.parent;
            })
            .filter(Boolean)
        );

        const availableDrivers =
          drivers.filter(
            (driver) =>
              driver.status ===
              "available"
          );

        const assignedDrivers =
          drivers.filter(
            (driver) =>
              driver.status ===
              "assigned"
          );

        const vacantDriverRoutes =
          activeRoutes.filter(
            (route) =>
              !route.driver &&
              !route.driverName
          );

        const routeDetails =
          activeRoutes.map((route) => {
            const capacity = Number(
              route.vehicleCapacity || 0
            );

            const occupied = Number(
              route.assignedCount || 0
            );

            const vacant = Math.max(
              0,
              capacity - occupied
            );

            const occupancy = capacity
              ? Math.min(
                  100,
                  Math.round(
                    (occupied / capacity) *
                      100
                  )
                )
              : 0;

            return {
              id: route._id,
              name: route.routeName,
              bus: route.vehicleNumber,
              driver:
                route.driverName ||
                route.driver?.name ||
                "Not assigned",
              capacity,
              occupied,
              vacant,
              occupancy
            };
          });

        if (!cancelled) {
          setStats({
            buses: busNumbers.size,
            totalRoutes: routes.length,
            activeRoutes:
              activeRoutes.length,
            vacantSeats,
            totalCapacity,
            occupiedSeats,
            students: students.length,
            parents: parentIds.size,
            assignments:
              assignments.length,
            drivers: drivers.length,
            availableDrivers:
              availableDrivers.length,
            assignedDrivers:
              assignedDrivers.length,
            vacantDriverRoutes:
              vacantDriverRoutes.length,
            routeDetails,
            loading: false
          });
        }
      } catch (error) {
        console.error(
          "Dashboard statistics error:",
          error
        );

        if (!cancelled) {
          setStats((current) => ({
            ...current,
            loading: false
          }));
        }
      }
    };

    loadStats();

    const timer = setInterval(
      loadStats,
      30000
    );

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isAdmin]);

  const occupancy = stats.totalCapacity
    ? Math.min(
        100,
        Math.round(
          (stats.occupiedSeats /
            stats.totalCapacity) *
            100
        )
      )
    : 0;

  return (
    <section>
      <Header
        kicker="OVERVIEW"
        title={
          isParent
            ? `Transport for ${subject}`
            : "Your transport, at a glance"
        }
        subtitle={
          isParent
            ? `${children.length} ${
                children.length === 1
                  ? "child"
                  : "children"
              } connected to this account.`
            : `Welcome back, ${user.name}.`
        }
      />

      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">
            ROUTEFLOW
          </span>

          <h2>
            {isParent
              ? "One family account. Every school journey."
              : "School transport without the clutter."}
          </h2>

          <p>
            {isParent
              ? "Switch between children from the sidebar to see each student's transport details."
              : "Routes, buses, seats, drivers and student registrations are connected through your school transport system."}
          </p>
        </div>

        <div className="system-status">
          <span />
          System operational
        </div>
      </div>

      {isParent ? (
        <div className="dashboard-grid">
          <div className="overview-card large">
            <span className="card-kicker">
              ACTIVE CHILD
            </span>

            <div className="child-overview">
              <div className="large-avatar">
                {activeChild?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "—"}
              </div>

              <div>
                <h3>
                  {activeChild?.name ||
                    "Add your first child"}
                </h3>

                {activeChild ? (
                  <p>
                    Class{" "}
                    {activeChild.className} ·
                    Roll{" "}
                    {activeChild.rollNumber}
                  </p>
                ) : (
                  <p>
                    Use “+ Add child” to create a
                    student profile.
                  </p>
                )}
              </div>
            </div>
          </div>

          <InfoCard
            title="Children"
            value={children.length}
          />

          <InfoCard
            title="Account"
            value="Parent"
          />
        </div>
      ) : isAdmin ? (
        <>
          <div className="stats dashboard-stats">
            <StatCard
              title="Buses In Service"
              value={
                stats.loading
                  ? "—"
                  : stats.buses
              }
              description={`${stats.activeRoutes} active routes`}
            />

            <StatCard
              title="Vacant Seats"
              value={
                stats.loading
                  ? "—"
                  : stats.vacantSeats
              }
              description={
                stats.loading
                  ? "Calculating capacity"
                  : `Out of ${stats.totalCapacity} total seats`
              }
            />

            <StatCard
              title="Registered Students"
              value={
                stats.loading
                  ? "—"
                  : stats.students
              }
              description="Student profiles in the system"
            />

            <StatCard
              title="Parent Accounts"
              value={
                stats.loading
                  ? "—"
                  : stats.parents
              }
              description="Parents with linked children"
            />

            <StatCard
              title="Total Drivers"
              value={
                stats.loading
                  ? "—"
                  : stats.drivers
              }
              description="Registered drivers"
            />

            <StatCard
              title="Available Drivers"
              value={
                stats.loading
                  ? "—"
                  : stats.availableDrivers
              }
              description="Ready for assignment"
            />

            <StatCard
              title="Assigned Drivers"
              value={
                stats.loading
                  ? "—"
                  : stats.assignedDrivers
              }
              description="Currently assigned"
            />

            <StatCard
              title="Transport Assignments"
              value={
                stats.loading
                  ? "—"
                  : stats.assignments
              }
              description="Student-route assignments"
            />
          </div>

          <div className="dashboard-insights">
            <div className="overview-card insight-card">
              <div className="card-heading">
                <div>
                  <span className="card-kicker">
                    CAPACITY
                  </span>

                  <h3>
                    Transport capacity
                  </h3>
                </div>

                <strong>
                  {stats.loading
                    ? "—"
                    : `${occupancy}%`}
                </strong>
              </div>

              <div className="dashboard-progress">
                <span
                  style={{
                    width: `${occupancy}%`
                  }}
                />
              </div>

              <p className="insight-text">
                {stats.loading
                  ? "Loading current route capacity."
                  : `${stats.occupiedSeats} seats occupied and ${stats.vacantSeats} seats still available.`}
              </p>
            </div>

            <div className="overview-card insight-card">
              <div className="card-heading">
                <div>
                  <span className="card-kicker">
                    DRIVER POOL
                  </span>

                  <h3>
                    Driver availability
                  </h3>
                </div>

                <strong>
                  {stats.loading
                    ? "—"
                    : stats.availableDrivers}
                </strong>
              </div>

              <p className="insight-text">
                {stats.loading
                  ? "Loading driver availability."
                  : stats.availableDrivers >
                    0
                  ? `${stats.availableDrivers} driver${
                      stats.availableDrivers ===
                      1
                        ? ""
                        : "s"
                    } available for automatic assignment.`
                  : "No vacant drivers are currently available."}
              </p>

              {stats.vacantDriverRoutes >
                0 && (
                <p className="insight-warning">
                  {
                    stats.vacantDriverRoutes
                  } active route
                  {stats.vacantDriverRoutes ===
                  1
                    ? ""
                    : "s"}{" "}
                  still need a driver.
                </p>
              )}
            </div>
          </div>

          <div className="overview-card dashboard-route-panel">
            <div className="panel-heading-row">
              <div>
                <span className="card-kicker">
                  NETWORK
                </span>

                <h3>
                  Active route overview
                </h3>

                <p className="muted">
                  Live capacity and driver status
                  for every active route.
                </p>
              </div>

              <div className="route-summary-pill">
                {stats.activeRoutes} active
              </div>
            </div>

            {stats.loading ? (
              <div className="empty compact-empty">
                Loading route information...
              </div>
            ) : stats.routeDetails.length ===
              0 ? (
              <div className="empty compact-empty">
                No active routes have been
                configured.
              </div>
            ) : (
              <div className="dashboard-route-list">
                {stats.routeDetails.map(
                  (route) => (
                    <div
                      className="dashboard-route-row"
                      key={route.id}
                    >
                      <div className="dashboard-route-main">
                        <strong>
                          {route.name}
                        </strong>

                        <span>
                          {route.bus} ·{" "}
                          {route.driver}
                        </span>
                      </div>

                      <div className="dashboard-route-capacity">
                        <div className="dashboard-route-numbers">
                          <span>
                            {route.occupied}/
                            {route.capacity}{" "}
                            seats
                          </span>

                          <strong>
                            {route.vacant} vacant
                          </strong>
                        </div>

                        <div className="dashboard-route-bar">
                          <span
                            style={{
                              width: `${route.occupancy}%`
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className={
                          route.driver ===
                          "Not assigned"
                            ? "route-driver-status vacant"
                            : "route-driver-status"
                        }
                      >
                        {route.driver ===
                        "Not assigned"
                          ? "Driver needed"
                          : "Driver assigned"}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="dashboard-quick-grid">
            <div className="overview-card quick-card">
              <span className="card-kicker">
                FLEET
              </span>

              <strong>
                {stats.buses}
              </strong>

              <h3>Buses in service</h3>

              <p>
                {stats.totalRoutes} configured
                route
                {stats.totalRoutes === 1
                  ? ""
                  : "s"} across the transport
                network.
              </p>
            </div>

            <div className="overview-card quick-card">
              <span className="card-kicker">
                STUDENTS
              </span>

              <strong>
                {stats.students}
              </strong>

              <h3>Registered students</h3>

              <p>
                {stats.assignments} currently
                have a transport assignment.
              </p>
            </div>

            <div className="overview-card quick-card">
              <span className="card-kicker">
                SEATS
              </span>

              <strong>
                {stats.vacantSeats}
              </strong>

              <h3>Seats available</h3>

              <p>
                {stats.occupiedSeats} seats are
                currently occupied.
              </p>
            </div>

            <div className="overview-card quick-card">
              <span className="card-kicker">
                DRIVERS
              </span>

              <strong>
                {stats.availableDrivers}
              </strong>

              <h3>Ready to assign</h3>

              <p>
                Available drivers can be
                automatically allocated to vacant
                routes.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-grid student-dashboard-grid">
          <div className="overview-card large">
            <span className="card-kicker">
              YOUR ACCOUNT
            </span>

            <h3>Student transport</h3>

            <p>
              View your assigned route, vehicle and
              pickup point from My Transport.
            </p>
          </div>

          <InfoCard
            title="Account"
            value="Student"
          />

          <InfoCard
            title="Authentication"
            value="JWT"
          />
        </div>
      )}
    </section>
  );
}

function StatCard({
  title,
  value,
  description
}) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

/* =========================================================
   CHILDREN
========================================================= */

function ChildrenPage({
  children,
  activeChildId,
  onSwitch,
  onAdd,
  fail
}) {
  const [form, setForm] = useState(
    emptyChild
  );

  const [saving, setSaving] =
    useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await onAdd(form);
      setForm(emptyChild);
    } catch (e) {
      fail(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <Header
        kicker="FAMILY"
        title="Children"
        subtitle="Keep each student in one family account and switch between them when needed."
      />

      <div className="children-layout">
        <div className="panel family-list-panel">
          <div className="panel-heading-row">
            <div>
              <span className="card-kicker">
                YOUR FAMILY
              </span>

              <h3>
                {children.length
                  ? `${children.length} ${
                      children.length === 1
                        ? "child"
                        : "children"
                    }`
                  : "No children yet"}
              </h3>
            </div>
          </div>

          <div className="family-list">
            {children.map((child) => (
              <button
                key={child._id}
                type="button"
                className={
                  child._id ===
                  activeChildId
                    ? "family-row active"
                    : "family-row"
                }
                onClick={() =>
                  onSwitch(child._id)
                }
              >
                <span className="avatar">
                  {child.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </span>

                <span className="family-row-copy">
                  <strong>
                    {child.name}
                  </strong>

                  <small>
                    Class {child.className} ·
                    Roll{" "}
                    {child.rollNumber}
                  </small>
                </span>

                <span className="row-arrow">
                  ›
                </span>
              </button>
            ))}

            {!children.length && (
              <div className="empty compact-empty">
                Add a child using the form beside
                this list.
              </div>
            )}
          </div>
        </div>

        <form
          className="panel add-child-panel"
          onSubmit={submit}
        >
          <div className="panel-heading-row">
            <div>
              <span className="card-kicker">
                NEW STUDENT
              </span>

              <h3>Add a child</h3>
            </div>
          </div>

          <p className="panel-note">
            This creates a student profile under
            your parent account. You can switch to
            it immediately.
          </p>

          <label>
            Name

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Student name"
            />
          </label>

          <div className="form-two">
            <label>
              Roll number

              <input
                required
                value={form.rollNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rollNumber:
                      e.target.value
                  })
                }
              />
            </label>

            <label>
              Class

              <input
                required
                value={form.className}
                onChange={(e) =>
                  setForm({
                    ...form,
                    className:
                      e.target.value
                  })
                }
                placeholder="10-A"
              />
            </label>
          </div>

          <label>
            Phone{" "}
            <span className="optional">
              Optional
            </span>

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value
                })
              }
            />
          </label>

          <button
            className="primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Adding…"
              : "Add child"}
          </button>
        </form>
      </div>
    </section>
  );
}

/* =========================================================
   ROUTES
========================================================= */

function RoutesPage({
  user,
  notify,
  fail
}) {
  const [routes, setRoutes] =
    useState([]);

  const [form, setForm] =
    useState(emptyRoute);

  const [editing, setEditing] =
    useState(null);

  const load = () =>
    api("/routes")
      .then(setRoutes)
      .catch((e) =>
        fail(e.message)
      );

  useEffect(() => {
    load();
  }, []);

  const updateField = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const updatePoint = (
    index,
    key,
    value
  ) => {
    setForm((current) => {
      const copy = [
        ...current.pickupPoints
      ];

      copy[index] = {
        ...copy[index],
        [key]: value
      };

      return {
        ...current,
        pickupPoints: copy
      };
    });
  };

  const addPoint = () => {
    setForm((current) => ({
      ...current,
      pickupPoints: [
        ...current.pickupPoints,
        {
          name: "",
          address: "",
          order:
            current.pickupPoints.length +
            1
        }
      ]
    }));
  };

  const removePoint = (index) => {
    if (
      form.pickupPoints.length === 1
    )
      return;

    setForm((current) => ({
      ...current,
      pickupPoints:
        current.pickupPoints
          .filter(
            (_, pointIndex) =>
              pointIndex !== index
          )
          .map(
            (
              point,
              pointIndex
            ) => ({
              ...point,
              order:
                pointIndex + 1
            })
          )
    }));
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        vehicleCapacity:
          Number(
            form.vehicleCapacity
          ),

        pickupPoints:
          form.pickupPoints.map(
            (point, index) => ({
              ...point,
              order:
                Number(
                  point.order
                ) || index + 1
            })
          )
      };

      await api(
        editing
          ? `/routes/${editing}`
          : "/routes",
        {
          method: editing
            ? "PUT"
            : "POST",
          body: JSON.stringify(
            payload
          )
        }
      );

      setForm(emptyRoute);
      setEditing(null);

      notify(
        editing
          ? "Route updated."
          : "Route created."
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const edit = (route) => {
    setEditing(route._id);

    setForm({
      routeName:
        route.routeName || "",

      vehicleNumber:
        route.vehicleNumber || "",

      driverName:
        route.driverName || "",

      driverPhone:
        route.driverPhone || "",

      vehicleCapacity:
        route.vehicleCapacity || "",

      active:
        route.active !== false,

      pickupPoints:
        route.pickupPoints?.length
          ? route.pickupPoints
              .slice()
              .sort(
                (a, b) =>
                  a.order - b.order
              )
              .map(
                (
                  point,
                  index
                ) => ({
                  name:
                    point.name ||
                    "",

                  address:
                    point.address ||
                    "",

                  order:
                    point.order ||
                    index + 1
                })
              )
          : [
              {
                name: "",
                address: "",
                order: 1
              }
            ]
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyRoute);
  };

  const remove = async (id) => {
    if (
      !confirm(
        "Delete this route?"
      )
    )
      return;

    try {
      await api(
        `/routes/${id}`,
        {
          method: "DELETE"
        }
      );

      notify("Route deleted.");
      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const toggleStatus = async (
    route
  ) => {
    try {
      await api(
        `/routes/${route._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            active:
              !route.active
          })
        }
      );

      notify(
        route.active
          ? `${route.routeName} is now inactive.`
          : `${route.routeName} is now active.`
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  return (
    <section>
      <Header
        kicker="NETWORK"
        title="Routes"
        subtitle="Manage buses, drivers, capacity and pickup points."
      />

      {user.role === "admin" && (
        <form
          className="panel route-form"
          onSubmit={save}
        >
          <div className="panel-heading-row">
            <div>
              <span className="card-kicker">
                {editing
                  ? "UPDATE ROUTE"
                  : "NEW ROUTE"}
              </span>

              <h3>
                {editing
                  ? "Edit route"
                  : "Create a route"}
              </h3>
            </div>

            {editing && (
              <button
                type="button"
                className="secondary"
                onClick={
                  cancelEdit
                }
              >
                Cancel editing
              </button>
            )}
          </div>

          <div className="route-form-grid">
            <label>
              Route name

              <input
                required
                value={
                  form.routeName
                }
                onChange={(e) =>
                  updateField(
                    "routeName",
                    e.target.value
                  )
                }
                placeholder="Dombivli — Kharghar"
              />
            </label>

            <label>
              Bus number

              <input
                required
                value={
                  form.vehicleNumber
                }
                onChange={(e) =>
                  updateField(
                    "vehicleNumber",
                    e.target.value
                  )
                }
                placeholder="MH-04-AB-1234"
              />
            </label>

            <label>
              Total seats

              <input
                type="number"
                min="1"
                required
                value={
                  form.vehicleCapacity
                }
                onChange={(e) =>
                  updateField(
                    "vehicleCapacity",
                    e.target.value
                  )
                }
                placeholder="40"
              />
            </label>

            <label>
              Driver name

              <input
                value={
                  form.driverName
                }
                onChange={(e) =>
                  updateField(
                    "driverName",
                    e.target.value
                  )
                }
                placeholder="Rajesh Kumar"
              />
            </label>

            <label>
              Driver phone

              <input
                type="tel"
                value={
                  form.driverPhone
                }
                onChange={(e) =>
                  updateField(
                    "driverPhone",
                    e.target.value
                  )
                }
                placeholder="+91 98765 43210"
              />
            </label>

            <label className="route-status-field">
              Route status

              <button
                type="button"
                className={
                  form.active
                    ? "status-toggle active"
                    : "status-toggle"
                }
                onClick={() =>
                  updateField(
                    "active",
                    !form.active
                  )
                }
              >
                <span className="status-dot" />

                {form.active
                  ? "Active"
                  : "Inactive"}
              </button>
            </label>
          </div>

          <div className="full-width route-points-section">
            <div className="section-row">
              <div>
                <strong>
                  Pickup points
                </strong>

                <p className="muted">
                  Students can only be assigned
                  to points on this route.
                </p>
              </div>

              <button
                type="button"
                className="secondary"
                onClick={addPoint}
              >
                + Add point
              </button>
            </div>

            <div className="pickup-editor">
              {form.pickupPoints.map(
                (
                  point,
                  index
                ) => (
                  <div
                    className="pickup-editor-row"
                    key={index}
                  >
                    <div className="pickup-number">
                      {index + 1}
                    </div>

                    <input
                      required
                      placeholder="Point name"
                      value={
                        point.name
                      }
                      onChange={(e) =>
                        updatePoint(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <input
                      required
                      placeholder="Address"
                      value={
                        point.address
                      }
                      onChange={(e) =>
                        updatePoint(
                          index,
                          "address",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="icon-danger"
                      onClick={() =>
                        removePoint(
                          index
                        )
                      }
                      disabled={
                        form
                          .pickupPoints
                          .length === 1
                      }
                      title="Remove pickup point"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="full-width actions">
            <button
              className="primary"
              type="submit"
            >
              {editing
                ? "Save changes"
                : "Create route"}
            </button>

            {editing && (
              <button
                type="button"
                className="secondary"
                onClick={
                  cancelEdit
                }
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="route-summary">
        <div>
          <span className="card-kicker">
            FLEET
          </span>

          <strong>
            {
              routes.filter(
                (route) =>
                  route.active
              ).length
            }
          </strong>

          <span>active buses</span>
        </div>

        <div>
          <span className="card-kicker">
            SEATS
          </span>

          <strong>
            {routes.reduce(
              (
                total,
                route
              ) =>
                total +
                Math.max(
                  0,
                  Number(
                    route.vehicleCapacity ||
                      0
                  ) -
                    Number(
                      route.assignedCount ||
                        0
                    )
                ),
              0
            )}
          </strong>

          <span>
            vacant seats
          </span>
        </div>

        <div>
          <span className="card-kicker">
            ROUTES
          </span>

          <strong>
            {routes.length}
          </strong>

          <span>
            configured
          </span>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="empty">
          No routes have been created yet.
        </div>
      ) : (
        <div className="route-grid">
          {routes.map((route) => {
            const capacity =
              Number(
                route.vehicleCapacity ||
                  0
              );

            const assigned =
              Number(
                route.assignedCount ||
                  0
              );

            const vacant =
              Math.max(
                0,
                capacity - assigned
              );

            const occupancy =
              capacity
                ? Math.min(
                    100,
                    Math.round(
                      (assigned /
                        capacity) *
                        100
                    )
                  )
                : 0;

            return (
              <article
                className="route-card"
                key={route._id}
              >
                <div className="route-top">
                  <div>
                    <span className="eyebrow">
                      ROUTE
                    </span>

                    <h3>
                      {route.routeName}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className={
                      route.active
                        ? "status active-status status-button"
                        : "status status-button"
                    }
                    onClick={() =>
                      toggleStatus(
                        route
                      )
                    }
                  >
                    {route.active
                      ? "Active"
                      : "Inactive"}
                  </button>
                </div>

                <div className="route-vehicle-row">
                  <div>
                    <span className="route-meta-label">
                      BUS
                    </span>

                    <strong>
                      {route.vehicleNumber}
                    </strong>
                  </div>

                  <div>
                    <span className="route-meta-label">
                      DRIVER
                    </span>

                    <strong>
                      {route.driverName ||
                        "Not assigned"}
                    </strong>
                  </div>
                </div>

                {route.driverPhone && (
                  <div className="driver-phone">
                    {route.driverPhone}
                  </div>
                )}

                <div className="capacity route-capacity">
                  <div className="capacity-label">
                    <span>
                      Seat usage
                    </span>

                    <strong>
                      {assigned} /{" "}
                      {capacity}
                    </strong>
                  </div>

                  <div className="bar">
                    <span
                      style={{
                        width: `${occupancy}%`
                      }}
                    />
                  </div>

                  <div className="capacity-breakdown">
                    <span>
                      {assigned} occupied
                    </span>

                    <strong>
                      {vacant} vacant
                    </strong>
                  </div>
                </div>

                <div className="pickup-list">
                  {(route.pickupPoints ||
                    [])
                    .slice()
                    .sort(
                      (a, b) =>
                        a.order -
                        b.order
                    )
                    .map(
                      (
                        point,
                        index
                      ) => (
                        <div
                          className="point"
                          key={
                            point._id ||
                            index
                          }
                        >
                          <span>
                            {point.order}
                          </span>

                          <div>
                            <strong>
                              {point.name}
                            </strong>

                            <small>
                              {
                                point.address
                              }
                            </small>
                          </div>
                        </div>
                      )
                    )}
                </div>

                {user.role ===
                  "admin" && (
                  <div className="card-actions">
                    <button
                      className="secondary"
                      onClick={() =>
                        edit(route)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        remove(
                          route._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   STUDENTS
========================================================= */

function StudentsPage({ fail }) {
  const [students, setStudents] =
    useState([]);

  useEffect(() => {
    api("/students")
      .then(setStudents)
      .catch((e) =>
        fail(e.message)
      );
  }, []);

  return (
    <section>
      <Header
        kicker="ADMIN"
        title="Students"
        subtitle="Registered students available for route assignment."
      />

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll number</th>
              <th>Class</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>
                  {s.name ||
                    s.user?.name ||
                    "—"}
                </td>

                <td>
                  {s.rollNumber}
                </td>

                <td>
                  {s.className}
                </td>

                <td>
                  {s.user?.email ||
                    "Parent account"}
                </td>

                <td>
                  {s.phone || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================
   DRIVERS
========================================================= */

function DriversPage({
  user,
  notify,
  fail
}) {
  const [drivers, setDrivers] =
    useState([]);

  const [routes, setRoutes] =
    useState([]);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [licenseNumber, setLicenseNumber] =
    useState("");

  const load = async () => {
    try {
      const [
        driverData,
        routeData
      ] = await Promise.all([
        api("/drivers"),
        api("/routes")
      ]);

      setDrivers(driverData);
      setRoutes(routeData);
    } catch (e) {
      fail(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const availableDrivers =
    drivers.filter(
      (driver) =>
        driver.status ===
        "available"
    );

  const assignedDrivers =
    drivers.filter(
      (driver) =>
        driver.status ===
        "assigned"
    );

  const unassignedRoutes =
    routes.filter(
      (route) =>
        !route.driver &&
        route.active !== false
    );

  const addDriver = async (e) => {
    e.preventDefault();

    try {
      await api("/drivers", {
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          licenseNumber
        })
      });

      setName("");
      setPhone("");
      setLicenseNumber("");

      notify(
        "Driver added successfully."
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const autoAssign = async (
    routeId
  ) => {
    try {
      await api(
        "/drivers/auto-assign",
        {
          method: "POST",
          body: JSON.stringify({
            routeId
          })
        }
      );

      notify(
        "Driver assigned automatically."
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const unassign = async (
    routeId
  ) => {
    try {
      await api(
        "/drivers/unassign",
        {
          method: "POST",
          body: JSON.stringify({
            routeId
          })
        }
      );

      notify(
        "Driver is now available."
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const deleteDriver = async (
    driverId
  ) => {
    if (
      !confirm(
        "Delete this driver?"
      )
    )
      return;

    try {
      await api(
        `/drivers/${driverId}`,
        {
          method: "DELETE"
        }
      );

      notify(
        "Driver deleted."
      );

      load();
    } catch (e) {
      fail(e.message);
    }
  };

  return (
    <section>
      <Header
        kicker="FLEET"
        title="Drivers"
        subtitle="Manage your driver pool and automatically allocate vacant drivers."
      />

      <div className="driver-stats">
        <div className="driver-stat">
          <span>
            TOTAL DRIVERS
          </span>

          <strong>
            {drivers.length}
          </strong>

          <small>
            registered drivers
          </small>
        </div>

        <div className="driver-stat available">
          <span>AVAILABLE</span>

          <strong>
            {availableDrivers.length}
          </strong>

          <small>
            ready for assignment
          </small>
        </div>

        <div className="driver-stat assigned">
          <span>ASSIGNED</span>

          <strong>
            {assignedDrivers.length}
          </strong>

          <small>
            currently driving
          </small>
        </div>

        <div className="driver-stat">
          <span>
            VACANT ROUTES
          </span>

          <strong>
            {unassignedRoutes.length}
          </strong>

          <small>
            routes without drivers
          </small>
        </div>
      </div>

      {user?.role === "admin" && (
        <form
          className="panel driver-create"
          onSubmit={addDriver}
        >
          <div className="panel-heading-row">
            <div>
              <span className="card-kicker">
                NEW DRIVER
              </span>

              <h3>
                Add a driver
              </h3>

              <p className="muted">
                Add drivers to the available
                pool for automatic allocation.
              </p>
            </div>
          </div>

          <div className="driver-form-grid">
            <label>
              Driver name

              <input
                required
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Rajesh Kumar"
              />
            </label>

            <label>
              Phone

              <input
                required
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="9876543210"
              />
            </label>

            <label>
              License number

              <input
                required
                value={
                  licenseNumber
                }
                onChange={(e) =>
                  setLicenseNumber(
                    e.target.value
                  )
                }
                placeholder="MH14-2024-001"
              />
            </label>

            <button
              className="primary"
              type="submit"
            >
              Add driver
            </button>
          </div>
        </form>
      )}

      <div className="panel auto-driver-panel">
        <div className="panel-heading-row">
          <div>
            <span className="card-kicker">
              AUTO ASSIGN
            </span>

            <h3>
              Vacant routes
            </h3>

            <p className="muted">
              Automatically allocate an available
              driver to a route.
            </p>
          </div>

          <div className="available-driver-pill">
            <span />

            {availableDrivers.length}{" "}
            available
          </div>
        </div>

        {unassignedRoutes.length ===
        0 ? (
          <div className="empty compact-empty">
            Every active route currently has
            a driver.
          </div>
        ) : (
          <div className="auto-route-list">
            {unassignedRoutes.map(
              (route) => (
                <div
                  className="auto-route"
                  key={route._id}
                >
                  <div className="auto-route-info">
                    <strong>
                      {route.routeName}
                    </strong>

                    <span>
                      {route.vehicleNumber} ·{" "}
                      {
                        route.vehicleCapacity
                      }{" "}
                      seats
                    </span>
                  </div>

                  <button
                    className="primary small"
                    disabled={
                      availableDrivers.length ===
                      0
                    }
                    onClick={() =>
                      autoAssign(
                        route._id
                      )
                    }
                  >
                    {availableDrivers.length ===
                    0
                      ? "No driver available"
                      : "Auto assign"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="panel driver-list-panel">
        <div className="assignment-list-heading">
          <div>
            <span className="card-kicker">
              DRIVER POOL
            </span>

            <h3>
              All drivers
            </h3>
          </div>
        </div>

        {drivers.length === 0 ? (
          <div className="empty compact-empty">
            No drivers have been added yet.
          </div>
        ) : (
          <div className="driver-grid">
            {drivers.map(
              (driver) => (
                <article
                  className="driver-card"
                  key={driver._id}
                >
                  <div className="driver-card-top">
                    <div className="driver-avatar">
                      {driver.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <span
                      className={
                        driver.status ===
                        "available"
                          ? "driver-status available"
                          : "driver-status assigned"
                      }
                    >
                      {
                        driver.status
                      }
                    </span>
                  </div>

                  <h3>
                    {driver.name}
                  </h3>

                  <div className="driver-details">
                    <div>
                      <span>
                        PHONE
                      </span>

                      <strong>
                        {driver.phone}
                      </strong>
                    </div>

                    <div>
                      <span>
                        LICENSE
                      </span>

                      <strong>
                        {
                          driver.licenseNumber
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        ROUTE
                      </span>

                      <strong>
                        {driver
                          .assignedRoute
                          ?.routeName ||
                          "Not assigned"}
                      </strong>
                    </div>

                    {driver
                      .assignedRoute
                      ?.vehicleNumber && (
                      <div>
                        <span>
                          BUS
                        </span>

                        <strong>
                          {
                            driver
                              .assignedRoute
                              .vehicleNumber
                          }
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="driver-card-actions">
                    {driver.status ===
                      "assigned" &&
                      driver.assignedRoute && (
                        <button
                          className="secondary"
                          onClick={() =>
                            unassign(
                              driver
                                .assignedRoute
                                ._id
                            )
                          }
                        >
                          Release driver
                        </button>
                      )}

                    {driver.status ===
                      "available" && (
                      <button
                        className="danger"
                        onClick={() =>
                          deleteDriver(
                            driver._id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

function AssignmentsPage({
  fail
}) {
  const [assignments, setAssignments] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [routes, setRoutes] =
    useState([]);

  const [studentId, setStudentId] =
    useState("");

  const [routeId, setRouteId] =
    useState("");

  const [pickupPointId, setPickupPointId] =
    useState("");

  const load = async () => {
    try {
      const [
        a,
        s,
        r
      ] = await Promise.all([
        api("/assignments"),
        api("/students"),
        api("/routes")
      ]);

      setAssignments(a);
      setStudents(s);
      setRoutes(r);
    } catch (e) {
      fail(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedRoute =
    useMemo(
      () =>
        routes.find(
          (r) =>
            r._id === routeId
        ),
      [routes, routeId]
    );

  const assign = async (e) => {
    e.preventDefault();

    try {
      await api(
        "/assignments",
        {
          method: "POST",
          body: JSON.stringify({
            studentId,
            routeId,
            pickupPointId
          })
        }
      );

      setStudentId("");
      setRouteId("");
      setPickupPointId("");

      await load();
    } catch (e) {
      fail(e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api(
        `/assignments/${id}`,
        {
          method: "DELETE"
        }
      );

      await load();
    } catch (e) {
      fail(e.message);
    }
  };

  return (
    <section>
      <Header
        kicker="ADMIN"
        title="Assignments"
        subtitle="Assign students only when route capacity is available."
      />

      <form
        className="panel assignment-form"
        onSubmit={assign}
      >
        <div className="panel-title">
          New assignment
        </div>

        <label>
          Student

          <select
            required
            value={studentId}
            onChange={(e) =>
              setStudentId(
                e.target.value
              )
            }
          >
            <option value="">
              Select student
            </option>

            {students.map((s) => (
              <option
                key={s._id}
                value={s._id}
              >
                {s.name ||
                  s.user?.name}{" "}
                — {s.rollNumber}
              </option>
            ))}
          </select>
        </label>

        <label>
          Route

          <select
            required
            value={routeId}
            onChange={(e) => {
              setRouteId(
                e.target.value
              );

              setPickupPointId("");
            }}
          >
            <option value="">
              Select route
            </option>

            {routes.map((r) => (
              <option
                key={r._id}
                value={r._id}
                disabled={
                  r.assignedCount >=
                    r.vehicleCapacity ||
                  !r.active
                }
              >
                {r.routeName} —{" "}
                {r.assignedCount}/
                {r.vehicleCapacity}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pickup point

          <select
            required
            value={
              pickupPointId
            }
            onChange={(e) =>
              setPickupPointId(
                e.target.value
              )
            }
            disabled={
              !selectedRoute
            }
          >
            <option value="">
              Select pickup point
            </option>

            {selectedRoute?.pickupPoints
              .slice()
              .sort(
                (a, b) =>
                  a.order -
                  b.order
              )
              .map((p) => (
                <option
                  key={p._id}
                  value={p._id}
                >
                  {p.name}
                </option>
              ))}
          </select>
        </label>

        <button
          className="primary"
          type="submit"
        >
          Assign student
        </button>
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll no.</th>
              <th>Route</th>
              <th>
                Pickup point
              </th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {assignments.map(
              (a) => (
                <tr key={a._id}>
                  <td>
                    {a.student
                      ?.name ||
                      a.student
                        ?.user
                        ?.name}
                  </td>

                  <td>
                    {
                      a.student
                        ?.rollNumber
                    }
                  </td>

                  <td>
                    {
                      a.route
                        ?.routeName
                    }
                  </td>

                  <td>
                    {
                      a.pickupPointName
                    }
                  </td>

                  <td>
                    <button
                      className="danger small"
                      onClick={() =>
                        remove(
                          a._id
                        )
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================
   MY TRANSPORT
========================================================= */

function MyAssignmentPage({
  fail,
  studentId,
  student,
  isParent = false
}) {
  const [
    assignment,
    setAssignment
  ] = useState(undefined);

  useEffect(() => {
    setAssignment(undefined);

    const path = studentId
      ? `/assignments/mine?studentId=${encodeURIComponent(
          studentId
        )}`
      : "/assignments/mine";

    api(path)
      .then(setAssignment)
      .catch((e) =>
        fail(e.message)
      );
  }, [studentId, fail]);

  return (
    <section>
      <Header
        kicker="TRANSPORT"
        title={
          student?.name
            ? `${student.name}'s transport`
            : "My transport"
        }
        subtitle="Current route and pickup information."
      />

      {assignment ? (
        <div className="assignment-detail">
          <div className="detail-card">
            <span>Route</span>

            <strong>
              {
                assignment.route
                  ?.routeName
              }
            </strong>
          </div>

          <div className="detail-card">
            <span>Vehicle</span>

            <strong>
              {
                assignment.route
                  ?.vehicleNumber
              }
            </strong>
          </div>

          <div className="detail-card">
            <span>
              Pickup point
            </span>

            <strong>
              {
                assignment.pickupPointName
              }
            </strong>
          </div>

          <div className="detail-card">
            <span>
              Route capacity
            </span>

            <strong>
              {
                assignment.route
                  ?.assignedCount
              }
              /
              {
                assignment.route
                  ?.vehicleCapacity
              }
            </strong>
          </div>
        </div>
      ) : assignment ===
        null ? (
        <div className="empty">
          No transport assignment has been
          added for this student yet.
        </div>
      ) : isParent &&
        !studentId ? (
        <div className="empty">
          Add a child or choose a child from
          the sidebar first.
        </div>
      ) : (
        <div className="empty">
          Loading transport details…
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SHARED
========================================================= */

function Header({
  kicker = "TRANSPORT SYSTEM",
  title,
  subtitle
}) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">
          {kicker}
        </span>

        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>
    </header>
  );
}

function InfoCard({
  title,
  value
}) {
  return (
    <div className="info-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;