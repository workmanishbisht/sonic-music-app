import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  LogIn,
  UserPlus,
  Crown,
  Headphones,
  Bell,
  LogOut,
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("sonicLoggedIn") === "true"
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sonicUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // ==========================================
  // AUTH STATE
  // ==========================================
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn =
        localStorage.getItem("sonicLoggedIn") === "true";

      setIsLoggedIn(loggedIn);

      try {
        const savedUser = localStorage.getItem("sonicUser");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setUser(null);
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("sonicLoggedIn");
    localStorage.removeItem("sonicUser");

    setIsLoggedIn(false);
    setUser(null);

    navigate("/");
  };

  const userName = user?.name || "Manish Bisht";

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header
      className="
        sticky top-0 z-50
        flex h-[70px] w-full min-w-0 shrink-0
        items-center
        gap-3
        border-b border-white/[0.06]
        bg-[#070c0f]/95
        px-4
        backdrop-blur-xl

        sm:h-[76px]
        sm:px-6

        lg:h-[82px]
        lg:gap-6
        lg:px-8
    "
    >

      {/* ==========================================
          SEARCH
      ========================================== */}
      <div
        className="
          min-w-0
          flex-1
          lg:max-w-[620px]
      "
      >
        <div className="relative w-full">

          <Search
            size={18}
            className="
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-[#7d888e]

              sm:left-4
          "
          />

          <input
            type="text"
            placeholder="What do you want to play?"
            className="
              h-10
              w-full
              rounded-[4px]
              border
              border-white/[0.07]
              bg-[#141b20]
              pl-10
              pr-10
              text-[12px]
              text-white
              outline-none
              transition-all

              placeholder:text-[#68747a]

              hover:border-white/[0.12]

              focus:border-[#10aaa9]/60
              focus:bg-[#171f24]

              sm:h-11
              sm:pl-11
              sm:pr-14
              sm:text-[13px]
          "
          />

          {/* Keyboard shortcut */}
          <span
            className="
              absolute
              right-2.5
              top-1/2
              hidden
              h-6
              -translate-y-1/2
              items-center
              rounded-[4px]
              border
              border-white/[0.06]
              bg-white/[0.04]
              px-2
              text-[11px]
              text-[#68747a]

              sm:flex
          "
          >
            /
          </span>

        </div>
      </div>

      {/* ==========================================
          RIGHT ACTIONS
      ========================================== */}
      <div
        className="
          ml-auto
          flex
          shrink-0
          items-center
          gap-1

          sm:gap-2

          lg:gap-3
      "
      >

        {/* ========================================
            LOGGED OUT
        ======================================== */}
        {!isLoggedIn ? (
          <>
            {/* Premium */}
            <button
              type="button"
              className="
                hidden
                items-center
                gap-2
                rounded-[4px]
                px-2
                py-2
                text-[12px]
                font-medium
                text-[#f4c542]
                transition

                hover:bg-[#f4c542]/[0.08]
                hover:text-[#ffd95a]

                lg:flex
            "
            >
              <Crown size={15} />
              <span>Premium</span>
            </button>

            {/* Support */}
            <button
              type="button"
              className="
                hidden
                items-center
                gap-2
                rounded-[4px]
                px-2
                py-2
                text-[12px]
                font-medium
                text-[#a5afb4]
                transition

                hover:bg-white/[0.04]
                hover:text-white

                xl:flex
            "
            >
              <Headphones size={15} />
              <span>Support</span>
            </button>

            {/* Divider */}
            <div
              className="
                hidden
                h-6
                w-px
                bg-white/[0.08]

                sm:block
            "
            />

            {/* Login */}
            <Link
              to="/login"
              className="
                flex
                h-9
                shrink-0
                items-center
                gap-1.5
                rounded-[4px]
                px-2
                text-[11px]
                font-semibold
                text-[#d5dbde]
                transition

                hover:bg-white/[0.05]
                hover:text-white

                sm:h-10
                sm:gap-2
                sm:px-3
                sm:text-[12px]

                lg:px-4
            "
            >
              <LogIn size={15} />

              <span>Log in</span>
            </Link>

            {/* Sign Up */}
            <Link
              to="/signup"
              className="
                flex
                h-9
                shrink-0
                items-center
                gap-1.5
                rounded-[4px]
                bg-[#10aaa9]
                px-2.5
                text-[11px]
                font-semibold
                text-white
                shadow-[0_6px_20px_rgba(16,170,169,0.12)]
                transition

                hover:bg-[#12c1bf]

                sm:h-10
                sm:gap-2
                sm:px-4
                sm:text-[12px]

                lg:px-5
            "
            >
              <UserPlus size={15} />

              <span>Sign up</span>
            </Link>
          </>
        ) : (

          /* ========================================
             LOGGED IN
          ======================================== */
          <>
            {/* Premium */}
            <button
              type="button"
              className="
                hidden
                items-center
                gap-2
                rounded-[4px]
                px-2
                py-2
                text-[12px]
                font-medium
                text-[#f4c542]
                transition

                hover:bg-[#f4c542]/[0.08]
                hover:text-[#ffd95a]

                lg:flex
            "
            >
              <Crown size={15} />
              <span>Premium</span>
            </button>

            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              className="
                relative
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-[#a5afb4]
                transition

                hover:bg-white/[0.05]
                hover:text-white
            "
            >
              <Bell size={18} />

              <span
                className="
                  absolute
                  right-[7px]
                  top-[6px]
                  h-[5px]
                  w-[5px]
                  rounded-full
                  bg-[#10aaa9]
              "
              />
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="
                group
                flex
                shrink-0
                items-center
                gap-2
                rounded-[4px]
                px-1
                py-1.5
                transition

                hover:bg-white/[0.04]

                sm:gap-2.5
                sm:px-2
            "
            >

              {/* Avatar */}
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#10aaa9]
                  text-[10px]
                  font-semibold
                  text-white

                  sm:h-9
                  sm:w-9
                  sm:text-[11px]
              "
              >
                {getInitials(userName)}
              </div>

              {/* Name */}
              <span
                className="
                  hidden
                  max-w-[110px]
                  truncate
                  text-[12px]
                  font-medium
                  text-white

                  sm:block
                  lg:max-w-[130px]
              "
              >
                {userName}
              </span>

              {/* Logout */}
              <LogOut
                size={15}
                className="
                  hidden
                  text-[#68747a]
                  transition
                  group-hover:text-red-400

                  sm:block
              "
              />

            </button>
          </>
        )}

      </div>
    </header>
  );
}