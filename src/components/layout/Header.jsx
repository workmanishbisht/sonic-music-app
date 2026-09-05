
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  LogIn,
  UserPlus,
  Crown,
  Headphones,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { songs } from "@/data/songs";

/* =========================================================
   TOAST
========================================================= */

function Toast({ type = "success", message, onClose }) {
  const isSuccess = type === "success";

  return (
    <div
      className="
            pointer-events-none
            fixed
            bottom-[105px]
            left-1/2
            z-[9999]
            w-full
            -translate-x-1/2
            px-5
        "
    >
      <div
        className="
                    pointer-events-auto
                    mx-auto
                    flex
                    w-full
                    max-w-[390px]
                    items-center
                    gap-3
                    rounded-[8px]
                    border
                    border-white/[0.08]
                    bg-[#151d21]
                    px-5
                    py-4
                    shadow-[0_20px_70px_rgba(0,0,0,0.55)]
                    animate-[toastIn_0.35s_ease-out]
                "
      >
        <div
          className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${isSuccess
              ? "bg-[#10aaa9]/10 text-[#10aaa9]"
              : "bg-red-500/10 text-red-400"
            }
                    `}
        >
          {isSuccess ? (
            <CheckCircle2
              size={21}
              strokeWidth={2}
            />
          ) : (
            <XCircle
              size={21}
              strokeWidth={2}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white">
            {isSuccess
              ? "Success"
              : "Something went wrong"}
          </p>

          <p className="mt-0.5 text-[12px] leading-5 text-[#8b969d]">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-[#68747a]
                        transition
                        hover:bg-white/[0.05]
                        hover:text-white
                    "
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

export default function Header() {
  const navigate = useNavigate();

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const { playSong } = usePlayer();

  /* =====================================================
     STATES
  ===================================================== */

  const [searchValue, setSearchValue] = useState("");

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  const [toast, setToast] = useState(null);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  /* =====================================================
     SEARCH KEYBOARD SHORTCUT
  ===================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target;

        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.isContentEditable
        ) {
          return;
        }

        event.preventDefault();

        const searchInput =
          document.getElementById(
            "sonic-search"
          );

        searchInput?.focus();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =====================================================
     CLOSE PROFILE ON OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setIsProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setSearchValue((previous) =>
          previous ? previous : ""
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =====================================================
     ESCAPE CLOSE
  ===================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =====================================================
     AUTO CLOSE TOAST
  ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await signOut(auth);

      setIsProfileOpen(false);

      /* =============================================
         LOGOUT SUCCESS TOAST
      ============================================= */

      setToast({
        type: "success",
        message:
          "You're logged out successfully.",
      });

      /* =============================================
         GO HOME AFTER TOAST
      ============================================= */

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );

      setToast({
        type: "error",
        message:
          "Unable to log out. Please try again.",
      });

    } finally {
      setIsLoggingOut(false);
    }
  };

  /* =====================================================
     USER NAME
  ===================================================== */

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Sonic User";

  /* =====================================================
     USER EMAIL
  ===================================================== */

  const userEmail =
    user?.email || "";

  /* =====================================================
     USER INITIALS
  ===================================================== */

  const getInitials = (name) => {
    if (!name) return "SU";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const searchQuery = searchValue.trim().toLowerCase();

  const searchResults = searchQuery
    ? songs
      .filter((song) => {
        const title = song.title?.toLowerCase() || "";
        const artist = song.artist?.toLowerCase() || "";
        const album = song.album?.toLowerCase() || "";

        return (
          title.includes(searchQuery) ||
          artist.includes(searchQuery) ||
          album.includes(searchQuery)
        );
      })
      .slice(0, 6)
    : [];

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // Search is live; keep the dropdown open instead
    // of navigating to a separate page.
  };

  const handleSearchResultClick = (song) => {
    if (!song?.audio) return;

    playSong(song);
    setSearchValue("");
  };

  /* =====================================================
     PROFILE TOGGLE
  ===================================================== */

  const handleProfileToggle = () => {
    setIsProfileOpen(
      (previous) => !previous
    );
  };

  return (
    <>
      <header
        className="
                    sticky
                    top-0
                    z-50
                    flex
                    h-[70px]
                    w-full
                    min-w-0
                    shrink-0
                    items-center
                    gap-3
                    border-b
                    border-white/[0.06]
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

        {/* =================================================
                    SEARCH
                ================================================= */}

        <form
          onSubmit={
            handleSearchSubmit
          }
          className="
                        min-w-0
                        flex-1
                        lg:max-w-[620px]
                    "
        >
          <div
            ref={searchRef}
            className="relative w-full"
          >

            <Search
              size={18}
              className="
                                pointer-events-none
                                absolute
                                left-3.5
                                top-1/2
                                -translate-y-1/2
                                text-[#7d888e]

                                sm:left-4
                            "
            />

            <input
              id="sonic-search"
              type="text"
              value={searchValue}
              onChange={
                handleSearchChange
              }
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

            <span
              className="
                                pointer-events-none
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

            {/* =================================================
                LIVE SEARCH DROPDOWN
            ================================================= */}

            {searchValue.trim() && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-[calc(100%+8px)]
                  z-[100]
                  overflow-hidden
                  rounded-[7px]
                  border
                  border-white/[0.08]
                  bg-[#11181d]
                  shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                  animate-[dropdownIn_0.18s_ease-out]
                "
              >
                {searchResults.length > 0 ? (
                  <>
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#68747a]">
                        Songs
                      </p>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto py-1">
                      {searchResults.map((song) => (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() =>
                            handleSearchResultClick(song)
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-3
                            py-2.5
                            text-left
                            transition
                            hover:bg-white/[0.05]
                          "
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[4px] bg-[#182126]">
                            {song.image ? (
                              <img
                                src={song.image}
                                alt={song.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-[#182126]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-medium text-white">
                              {song.title}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-[#7f8a90]">
                              {song.artist}
                            </p>
                          </div>

                          <span className="shrink-0 text-[10px] text-[#68747a]">
                            {song.album}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-white/[0.06] px-4 py-2.5">
                      <p className="text-[10px] text-[#68747a]">
                        Click a song to start playing
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="px-5 py-7 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#182126] text-[#68747a]">
                      <Search size={17} />
                    </div>

                    <p className="text-[12px] font-medium text-white">
                      No music found
                    </p>

                    <p className="mt-1 text-[10px] text-[#68747a]">
                      Try another song, artist or album.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </form>

        {/* =================================================
                    RIGHT ACTIONS
                ================================================= */}

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

          {/* =================================================
                        AUTH LOADING
                    ================================================= */}

          {loading ? (

            <div
              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                            "
            >
              <span
                className="
                                    h-4
                                    w-4
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-white/20
                                    border-t-[#10aaa9]
                                "
              />
            </div>

          ) : !isAuthenticated ? (

            /* =================================================
                LOGGED OUT
            ================================================= */

            <>
              {/* Premium */}

              <button
                type="button"
                onClick={() => navigate("/premium")}
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

                <span>
                  Premium
                </span>
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

                <span>
                  Support
                </span>
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

                <span>
                  Log in
                </span>
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

                <span>
                  Sign up
                </span>
              </Link>
            </>

          ) : (

            /* =================================================
                LOGGED IN
            ================================================= */

            <>
              {/* Premium */}

              <button
                type="button"
                onClick={() => navigate("/premium")}
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

                <span>
                  Premium
                </span>
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

              {/* =================================================
                                PROFILE
                            ================================================= */}

              <div
                ref={profileRef}
                className="
                                    relative
                                    shrink-0
                                "
              >

                {/* Profile Button */}

                <button
                  type="button"
                  onClick={
                    handleProfileToggle
                  }
                  aria-expanded={
                    isProfileOpen
                  }
                  aria-haspopup="menu"
                  className="
                                        group
                                        flex
                                        shrink-0
                                        items-center
                                        gap-2
                                        rounded-[5px]
                                        px-1
                                        py-1.5
                                        transition

                                        hover:bg-white/[0.05]

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
                                            overflow-hidden
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
                    {user?.photoURL ? (
                      <img
                        src={
                          user.photoURL
                        }
                        alt={
                          userName
                        }
                        className="
                                                    h-full
                                                    w-full
                                                    object-cover
                                                "
                      />
                    ) : (
                      getInitials(
                        userName
                      )
                    )}
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

                  {/* Chevron */}

                  <ChevronDown
                    size={14}
                    className={`
                                            hidden
                                            text-[#68747a]
                                            transition-transform
                                            duration-200

                                            sm:block

                                            ${isProfileOpen
                        ? "rotate-180 text-white"
                        : "group-hover:text-white"
                      }
                                        `}
                  />

                </button>

                {/* =================================================
                                    DROPDOWN
                                ================================================= */}

                {isProfileOpen && (
                  <div
                    className="
                                            absolute
                                            right-0
                                            top-[calc(100%+10px)]
                                            z-[100]
                                            w-[270px]
                                            overflow-hidden
                                            rounded-[7px]
                                            border
                                            border-white/[0.08]
                                            bg-[#11181d]
                                            shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                                            animate-[dropdownIn_0.18s_ease-out]
                                        "
                    role="menu"
                  >

                    {/* Account Info */}

                    <div
                      className="
                                                flex
                                                items-center
                                                gap-3
                                                border-b
                                                border-white/[0.07]
                                                px-4
                                                py-4
                                            "
                    >

                      <div
                        className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-full
                                                    bg-[#10aaa9]
                                                    text-[11px]
                                                    font-semibold
                                                    text-white
                                                "
                      >
                        {user?.photoURL ? (
                          <img
                            src={
                              user.photoURL
                            }
                            alt={
                              userName
                            }
                            className="
                                                            h-full
                                                            w-full
                                                            object-cover
                                                        "
                          />
                        ) : (
                          getInitials(
                            userName
                          )
                        )}
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                                                        truncate
                                                        text-[13px]
                                                        font-semibold
                                                        text-white
                                                    "
                        >
                          {userName}
                        </p>

                        <p
                          className="
                                                        mt-1
                                                        truncate
                                                        text-[11px]
                                                        text-[#727e84]
                                                    "
                        >
                          {userEmail}
                        </p>

                      </div>

                    </div>

                    {/* Menu */}

                    <div className="p-1.5">

                      {/* Profile */}

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(
                            false
                          );

                          console.log(
                            "Profile clicked"
                          );
                        }}
                        className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-[5px]
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-[12px]
                                                    font-medium
                                                    text-[#b7c0c4]
                                                    transition

                                                    hover:bg-white/[0.05]
                                                    hover:text-white
                                                "
                        role="menuitem"
                      >
                        <User
                          size={16}
                          className="text-[#7d898f]"
                        />

                        <span>
                          Profile
                        </span>
                      </button>

                      {/* Settings */}

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(
                            false
                          );

                          console.log(
                            "Settings clicked"
                          );
                        }}
                        className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-[5px]
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-[12px]
                                                    font-medium
                                                    text-[#b7c0c4]
                                                    transition

                                                    hover:bg-white/[0.05]
                                                    hover:text-white
                                                "
                        role="menuitem"
                      >
                        <Settings
                          size={16}
                          className="text-[#7d898f]"
                        />

                        <span>
                          Settings
                        </span>
                      </button>

                    </div>

                    {/* Divider */}

                    <div
                      className="
                                                mx-3
                                                h-px
                                                bg-white/[0.07]
                                            "
                    />

                    {/* Logout */}

                    <div className="p-1.5">

                      <button
                        type="button"
                        onClick={
                          handleLogout
                        }
                        disabled={
                          isLoggingOut
                        }
                        className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-[5px]
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-[12px]
                                                    font-medium
                                                    text-red-400
                                                    transition

                                                    hover:bg-red-500/[0.08]
                                                    hover:text-red-300

                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                        role="menuitem"
                      >

                        {isLoggingOut ? (
                          <span
                            className="
                                                            h-4
                                                            w-4
                                                            animate-spin
                                                            rounded-full
                                                            border-2
                                                            border-red-400/20
                                                            border-t-red-400
                                                        "
                          />
                        ) : (
                          <LogOut
                            size={16}
                          />
                        )}

                        <span>
                          {isLoggingOut
                            ? "Logging out..."
                            : "Log out"}
                        </span>

                      </button>

                    </div>

                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </header>

      {/* =================================================
                BOTTOM CENTER TOAST
            ================================================= */}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() =>
            setToast(null)
          }
        />
      )}
    </>
  );
}