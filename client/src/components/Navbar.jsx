import { IconButton, Badge } from "@mui/material";
import { Search, Person, Menu, Notifications } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLandlord, setIsLandlord] = useState(false); // Determine if user is a landlord
  const [search, setSearch] = useState("");

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search) {
      navigate(`/properties/search/${search}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search) {
      handleSearch();
    }
  };
  
  

  const checkLandlordStatus = async () => {
    if (!user) return; // Ensure user is defined before proceeding
    try {
      const response = await fetch(`http://localhost:3001/users/${user._id}/properties`);
      const data = await response.json();

      // Check if the user has any properties in the propertyList of creator
      const landlord = data.some(property => property.creator._id === user._id );
      setIsLandlord(landlord);

      // Fetch notifications if the user is a landlord
      /*if (landlord) {
        fetchNotifications();
      }*/
    } catch (error) {
      console.error("Error checking landlord status:", error);
    }
};

  // Fetch notifications for landlords
  /*const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3001/notification/${user._id}/`);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };*/
  // Fetch properties and notifications when the component mounts or user changes
  useEffect(() => {
    if (user) {
      checkLandlordStatus();
    }
  }, [user]);

  return (
    <div className="navbar">
      {/* Logo */}
      <a href="/">
        <img src="/assets/logo.webp" alt="logo" />
      </a>

      {/* Search Bar */}
      <div className="navbar_search">
      <input
  type="text"
  placeholder="Search ..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={handleKeyDown} // Added event for Enter key
/>

<IconButton disabled={search === ""} onClick={handleSearch}>
  <Search sx={{ color: variables.pinkred }} />
</IconButton>

      </div>

      {/* Right Section */}
      <div className="navbar_right">
        {/* Host Link */}
        {user ? (
          <a href="/create-listing" className="host">
            Become A Host
          </a>
        ) : (
          <a href="/login" className="host">
            Become A Host
          </a>
        )}

        {/* Notification Icon (for landlords only) */}
        {
          <IconButton
            onClick={() => {
              navigate(`/notification/${user._id}`);
            }}
          >
            <Badge
              badgeContent={notifications.length}
              color="error"
              overlap="circular"
            >
              <Notifications sx={{ color: variables.darkgrey }} />
            </Badge>
          </IconButton>
        }

        {/* Account Menu */}
        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={`http://localhost:3001/${user.profileimagePath.replace(
                "public",
                ""
              )}`}
              alt="profile photo"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownMenu && (
          <div className="navbar_right_accountmenu">
            {!user ? (
              <>
                <Link to="/login">Log In</Link>
                <Link to="/register">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to={`/${user._id}/trips`}>Previous Visit Requests</Link>
                <Link to={`/${user._id}/wishList`}>Wish List</Link>
                <Link to={`/${user._id}/properties`}>Property List</Link>
                <Link to={`/${user._id}/reservations`}>Reservation List</Link>
                <Link to={`/rent-predictor`}>Predict The Rent</Link>
                <Link to="/create-listing">Become A Host</Link>
                <Link
                  to="/login"
                  onClick={() => {
                    dispatch(setLogout());
                  }}
                >
                  Log Out
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;