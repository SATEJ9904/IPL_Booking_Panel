import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import CSK from "../Images/CSK.png";
import DC from "../Images/DC.png";
import KKR from "../Images/KKR.png";
import MI from "../Images/MI.png";
import PBKS from "../Images/Punjab.png";
import RR from "../Images/RR.png";
import RCB from "../Images/rcb.png";
import SRH from "../Images/SRH.png";
import LSG from "../Images/LSG.png";
import GT from "../Images/Gujarat.jpg";
import axios from "axios";
import { toast } from "react-toastify";
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SearchIcon from '@mui/icons-material/Search';
import "react-toastify/dist/ReactToastify.css";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AddIcon from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';

// Import background images
import stadiumBg from "../Images/stadium-bg.jpg";
import ticketPattern from "../Images/ticket-pattern.png";
import premiumTexture from "../Images/premium-texture.jpg";

// Styled components for premium look
const PremiumCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.95) 100%)`,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
  },
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700, #C0C0C0, #CD7F32)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1E3A8A 0%, #2563EB 50%, #1E40AF 100%)',
  color: '#fff',
  fontWeight: 'bold',
  padding: '10px 24px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textTransform: 'none',
  letterSpacing: '0.5px',
  '&:hover': {
    background: 'linear-gradient(45deg, #1E3A8A 0%, #2563EB 70%, #1E40AF 100%)',
    boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255,255,255,0.9)',
  color: theme.palette.text.primary,
  border: '1px solid rgba(0,0,0,0.1)',
  fontWeight: '500',
  padding: '8px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    background: 'rgba(255,255,255,1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
}));

// Team data with logos
const teams = [
  { name: "Chennai Super Kings (CSK)", logo: CSK, primaryColor: '#FDB913' },
  { name: "Delhi Capitals (DC)", logo: DC, primaryColor: '#004C93' },
  { name: "Gujarat Titans (GT)", logo: GT, primaryColor: '#7DBBEB' },
  { name: "Kolkata Knight Riders (KKR)", logo: KKR, primaryColor: '#3A225D' },
  { name: "Mumbai Indians (MI)", logo: MI, primaryColor: '#005DA0' },
  { name: "Punjab Kings (PBKS)", logo: PBKS, primaryColor: '#ED1C24' },
  { name: "Rajasthan Royals (RR)", logo: RR, primaryColor: '#FFC0CB' },
  { name: "Royal Challengers Bangalore (RCB)", logo: RCB, primaryColor: '#EC1C24' },
  { name: "Sunrisers Hyderabad (SRH)", logo: SRH, primaryColor: '#FF822A' },
  { name: "Lucknow Super Giants (LSG)", logo: LSG, primaryColor: '#00A6B0' },
];

// Available package types
const packageTypes = [
  { name: "VVIP", color: 'linear-gradient(135deg, #FFD700, #FF8C00)' },
  { name: "Platinum", color: 'linear-gradient(135deg, #E5E4E2, #C0C0C0)' },
  { name: "Gold", color: 'linear-gradient(135deg, #FFD700, #D4AF37)' },
  { name: "Silver", color: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' }
];

const MatchSlots = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [matchSlots, setMatchSlots] = useState([]);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [isAddPackageDialogOpen, setIsAddPackageDialogOpen] = useState(false);
  const [selectedSlotForPackage, setSelectedSlotForPackage] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMatchSlot, setNewMatchSlot] = useState({
    team1: "",
    team2: "",
    fromTime: "",
    toTime: "",
    date: "",
  });
  const [newPackage, setNewPackage] = useState({
    packageName: "",
    packagePrice: "",
    seatCount: "",
    slot: { slotId: "" },
  });
  const [isEditSlotDialogOpen, setIsEditSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState({
    slotId: 0,
    team1: "",
    team2: "",
    slotStart: "",
    slotEnd: "",
    slotDate: "",
    slotStatus: "open", // Added slot status
    packages: []
  });
  const [slotPackages, setSlotPackages] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [availablePackagesForSlot, setAvailablePackagesForSlot] = useState([]);

  // Handle delete error alert close
  const handleDeleteErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setDeleteError(false);
  };

  // Get available packages for a slot (packages not already added)
  const getAvailablePackagesForSlot = (slotId, allPackages) => {
    const addedPackageNames = allPackages
      .filter(pkg => pkg.slot.slotId === slotId)
      .map(pkg => pkg.packageName);
    
    return packageTypes.filter(pkg => !addedPackageNames.includes(pkg.name));
  };

  const handleDeleteSlot = async () => {
    setIsDeleting(true);
    try {
      // First check if slot can be deleted (status is open)
      if (editingSlot.slotStatus !== "OPEN") {
        setDeleteError(true);
        setDeleteErrorMessage("Slot bookings are confirmed. Cannot delete slot.");
        setDeleteConfirmationOpen(false);
        return;
      }

      const response = await axios.delete(
        `https://msfunpark.com/funpark/api/slot/deleteSlot?slotId=${editingSlot.slotId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      toast.success("Slot deleted successfully");
      GetSlots();
      setIsEditSlotDialogOpen(false);
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to delete slot");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchPackagesForSlot = async (slotId) => {
    try {
      const response = await axios.get(
        `https://msfunpark.com/funpark/api/package/getPackagesBySlotId?slotId=${slotId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      setSlotPackages(response.data);
      return response.data.map(pkg => pkg.packageId.toString());
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to fetch packages for this slot");
      return [];
    }
  };

  const handleEditSlotClick = async (slot) => {
    const packages = await fetchPackagesForSlot(slot.slotId);
    const availablePkgs = getAvailablePackagesForSlot(slot.slotId, packages);
    setAvailablePackagesForSlot(availablePkgs);

    setEditingSlot({
      slotId: slot.slotId,
      team1: slot.team1,
      team2: slot.team2,
      slotStart: slot.fromTime,
      slotEnd: slot.toTime,
      slotDate: slot.date,
      slotStatus: slot.slotStatus || "open", // Default to "open" if status not provided
      packages: packages
    });

    setIsEditSlotDialogOpen(true);
  };

  const handleUpdateSlot = async () => {
    try {
      const requestData = {
        slotId: editingSlot.slotId,
        slotName: `${editingSlot.team1} VS ${editingSlot.team2}`,
        slotStart: editingSlot.slotStart,
        slotEnd: editingSlot.slotEnd,
        slotDate: editingSlot.slotDate,
        slotStatus: editingSlot.slotStatus,
        packages: editingSlot.packages
      };

      const response = await axios.put(
        "https://msfunpark.com/funpark/api/slot/updateSlot",
        requestData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      toast.success("Slot updated successfully");
      GetSlots();
      setIsEditSlotDialogOpen(false);
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error("Failed to update slot");
    }
  };

  useEffect(() => {
    GetSlots();
  }, []);

  useEffect(() => {
    // Filter slots whenever matchSlots, tabValue, or searchTerm changes
    filterSlots(tabValue, searchTerm);
  }, [matchSlots, tabValue, searchTerm]);

  const handleAddSlot = () => {
    const requestData = {
      slotName: `${newMatchSlot.team1}${" VS "}${newMatchSlot.team2}`,
      slotStart: `${newMatchSlot.fromTime}`,
      slotEnd: `${newMatchSlot.toTime}`,
      slotDate: `${newMatchSlot.date}`,
      slotStatus: "open" // New slots are always open by default
    };

    axios
      .post("https://msfunpark.com/funpark/api/slot/create-slot", requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((res) => {
        toast.success("Slot Created Successfully");
        GetSlots();
        setIsAddSlotDialogOpen(false);
        setNewMatchSlot({
          team1: "",
          team2: "",
          fromTime: "",
          toTime: "",
          date: "",
        });
      })
      .catch((error) => {
        toast.error("Error creating slot");
        console.error("Error:", error);
      });
  };

  const isMatchLive = (date, fromTime, toTime) => {
    const currentDate = new Date();
    const matchStart = new Date(`${date}T${fromTime}`);
    const matchEnd = new Date(`${date}T${toTime}`);
    return currentDate >= matchStart && currentDate <= matchEnd;
  };

  const isMatchUpcoming = (date, fromTime) => {
    const currentDate = new Date();
    const matchStart = new Date(`${date}T${fromTime}`);
    return currentDate < matchStart;
  };

  const isMatchCompleted = (date, toTime) => {
    const currentDate = new Date();
    const matchEnd = new Date(`${date}T${toTime}`);
    return currentDate > matchEnd;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const filterSlots = (tabIndex, searchTerm) => {
    let filtered = [...matchSlots];

    // First filter by search term if it exists
    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.team2.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Then filter by tab value
    if (tabIndex === 1) { // Upcoming
      filtered = filtered.filter(slot => isMatchUpcoming(slot.date, slot.fromTime));
    } else if (tabIndex === 2) { // Live
      filtered = filtered.filter(slot => isMatchLive(slot.date, slot.fromTime, slot.toTime));
    } else if (tabIndex === 3) { // Completed
      filtered = filtered.filter(slot => isMatchCompleted(slot.date, slot.toTime));
    } else { // All matches (tabIndex === 0)
      // Sort by status: live first, then upcoming, then completed
      filtered.sort((a, b) => {
        const aIsLive = isMatchLive(a.date, a.fromTime, a.toTime);
        const bIsLive = isMatchLive(b.date, b.fromTime, b.toTime);
        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;
        
        const aIsUpcoming = isMatchUpcoming(a.date, a.fromTime);
        const bIsUpcoming = isMatchUpcoming(b.date, b.fromTime);
        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;
        
        return 0;
      });
    }

    setFilteredSlots(filtered);
  };

  const handleAddPackage = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.getItem("authToken")}`);

    const raw = JSON.stringify({
      "packageName": newPackage.packageName,
      "packagePrice": parseFloat(newPackage.packagePrice),
      "seatCount": parseInt(newPackage.seatCount),
      "slot": {
        "slotId": parseInt(newPackage.slot.slotId),
      }
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://msfunpark.com/funpark/api/package/create-Package", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        toast.success("Package Created Successfully");
        setIsAddPackageDialogOpen(false);
        setNewPackage({
          packageName: "",
          packagePrice: "",
          seatCount: "",
          slot: { slotId: "" },
        });
        // Refresh slots to get updated package list
        GetSlots();
      })
      .catch((error) => {
        toast.error("Error creating package");
        console.error("Error:", error);
      });
  };

  const GetSlots = () => {
    axios
      .get("https://msfunpark.com/funpark/api/slot/getSlots", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      })
      .then((response) => {
      //  console.log(response.data)
        const formattedSlots = response.data.map((slot) => {
          const [team1, team2] = slot.slotName.split(" VS ");
          return {
            team1: team1,
            team2: team2,
            fromTime: slot.slotStart,
            toTime: slot.slotEnd,
            date: slot.slotDate,
            slotId: slot.slotId,
            slotName: slot.slotName,
            slotStatus: slot.slotStatus || "open" // Default to "open" if status not provided
          };
        });
        
        setMatchSlots(formattedSlots);
        setFilteredSlots(formattedSlots); // Initialize filteredSlots with all slots
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
        toast.error("Failed to fetch match slots");
      });
  };

  const handleCardClick = (slot) => {
    navigate("/booking", {
      state: {
        matchSlot: {
          ...slot,
          slotId: slot.slotId
        }
      }
    });
  };

  // Utility function to convert time to 12-hour format
  const convertTo12HourFormat = (timeString) => {
    if (!timeString) return '';
    
    // Extract hours and minutes
    const [hours, minutes] = timeString.split(':');
    const hourInt = parseInt(hours, 10);
    
    // Determine AM/PM
    const period = hourInt >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const twelveHour = hourInt % 12 || 12;
    
    // Return formatted time (without seconds if they exist)
    return `${twelveHour}:${minutes} ${period}`;
  };

  const handleAddPackageClick = async (slot) => {
    setSelectedSlotForPackage(slot);
    const packages = await fetchPackagesForSlot(slot.slotId);
    const availablePkgs = getAvailablePackagesForSlot(slot.slotId, packages);
    setAvailablePackagesForSlot(availablePkgs);
    
    setNewPackage({
      packageName: availablePkgs.length > 0 ? availablePkgs[0].name : "",
      packagePrice: "",
      seatCount: "",
      slot: { slotId: slot.slotId.toString() },
    });
    setIsAddPackageDialogOpen(true);
  };

  const isMatchTimingPassed = (date, fromTime) => {
    const currentDate = new Date();
    const matchDateTime = new Date(`${date}T${fromTime}`);
    return currentDate > matchDateTime;
  };

  const getAvailableTeams = () => {
    return teams.filter((team) => team.name !== newMatchSlot.team1);
  };

  const getTeamColor = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team ? team.primaryColor : '#666';
  };

  // Diagonal banner component for completed matches
  const CompletedBanner = () => (
    <Box sx={{
      position: 'absolute',
      top: 10,
      left: -30,
      width: '120px',
      backgroundColor: 'error.main',
      color: 'white',
      textAlign: 'center',
      transform: 'rotate(-45deg)',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      zIndex: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      padding: '2px 0'
    }}>
      COMPLETED
    </Box>
  );

  return (
    <Box sx={{
      p: isMobile ? 2 : 4,
      background: `url(${stadiumBg}) no-repeat center center fixed`,
      backgroundSize: 'cover',
      minHeight: '100vh'
    }}>
      {/* Error Snackbar for delete operation */}
      <Snackbar
        open={deleteError}
        autoHideDuration={6000}
        onClose={handleDeleteErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleDeleteErrorClose} severity="error" sx={{ width: '100%' }}>
          {deleteErrorMessage}
        </Alert>
      </Snackbar>

      {/* Hero Section */}
      <Paper elevation={0} sx={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        color: 'white',
        p: 3,
        mb: 3,
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <SportsCricketIcon sx={{ fontSize: 35, mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: '700' }}>
              Match Slots
            </Typography>
          </Box>

          <IconButton
            onClick={() => {
              localStorage.removeItem("authToken");
              navigate("/");
            }}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'rotate(180deg)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease',
              p: 1.5,
              borderRadius: '12px'
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search matches by team..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            mb: 0,
            background: "rgba(255,255,255,0.9)",
            borderRadius: "8px",
            width: "80%",
            "& .MuiOutlinedInput-root": {
              height: 36,
              fontSize: "0.85rem",
              padding: "5px 10px",
              "& fieldset": {
                borderColor: "transparent",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255,255,255,0.3)",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <Box sx={{ color: "text.secondary", mr: 1 }}>
                <SearchIcon fontSize="small" />
              </Box>
            ),
          }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFD700',
              height: '3px'
            }
          }}
        >
          <Tab
            label="All Matches"
            icon={<SportsCricketIcon fontSize="small" />}
            iconPosition="start"
            sx={{ color: 'white', fontWeight: '500', minHeight: '48px' }}
          />
          <Tab
            label="Upcoming"
            icon={<EventAvailableIcon fontSize="small" />}
            iconPosition="start"
            sx={{ color: 'white', fontWeight: '500', minHeight: '48px' }}
          />
          <Tab
            label="Live"
            icon={<LiveTvIcon fontSize="small" />}
            iconPosition="start"
            sx={{
              color: '#FF0000',
              fontWeight: '700',
              '&.Mui-selected': { color: '#FF0000' }
            }}
          />
          <Tab
            label="Completed"
            icon={<DoneAllIcon fontSize="small" />}
            iconPosition="start"
            sx={{ color: 'white', fontWeight: '500', minHeight: '48px' }}
          />
        </Tabs>
      </Paper>

      {/* Match Slot Cards */}
      <Grid container spacing={isMobile ? 2 : 4}>
        {/* Add Slot Card - Only shown in All Matches tab */}
        {tabValue === 0 && (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <PremiumCard
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '225px',
                background: 'linear-gradient(135deg, rgba(30,58,138,0.1) 0%, rgba(37,99,235,0.1) 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(30,58,138,0.15) 0%, rgba(37,99,235,0.15) 100%)'
                }
              }}
              onClick={() => setIsAddSlotDialogOpen(true)}
            >
              <CardActionArea
                sx={{
                  height: '90%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0.4) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      border: '2px dashed rgba(37,99,235,0.5)'
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: '600', color: theme.palette.primary.main }}>
                    Add New Match
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#fff", mt: 1 }}>
                    Click to create a new match slot
                  </Typography>
                </CardContent>
              </CardActionArea>
            </PremiumCard>
          </Grid>
        )}
        {filteredSlots.map((slot, index) => {
          const isPassed = isMatchCompleted(slot.date, slot.toTime);
          const isLive = isMatchLive(slot.date, slot.fromTime, slot.toTime);
          const isUpcoming = isMatchUpcoming(slot.date, slot.fromTime);

          // Get team data and colors
          const team1Data = teams.find((team) => team.name === slot.team1);
          const team2Data = teams.find((team) => team.name === slot.team2);
          const team1Color = team1Data?.primaryColor || '#666';
          const team2Color = team2Data?.primaryColor || '#666';

          return (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              
              <PremiumCard
                sx={{
                  opacity: isPassed ? 0.8 : 1,
                  pointerEvents: isPassed ? 'none' : 'auto',
                  '&::before': {
                    background: isLive
                      ? 'linear-gradient(90deg, #FF0000, #FF0000)'
                      : `linear-gradient(90deg, ${team1Color}, #666, ${team2Color})`
                  }
                }}
              >
                {isPassed && <CompletedBanner />}
                {isLive && (
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#FF0000',
                    color: 'white',
                    px: 1,
                    py: 0.3,
                    borderRadius: '12px',
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 1
                  }}>
                    <LiveTvIcon sx={{ fontSize: isMobile ? '0.8rem' : '1rem', mr: 0.5 }} />
                    LIVE
                  </Box>
                )}

                <CardActionArea onClick={() => !isPassed && handleCardClick(slot)}>
                  <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    {/* Match Teams */}
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      {team1Data && (
                        <Box sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          mr: isMobile ? 0 : 1,
                          mb: isMobile ? 1 : 0,
                          width: isMobile ? '100%' : 'auto'
                        }}>
                          <Avatar
                            src={team1Data.logo}
                            sx={{
                              width: isMobile ? 48 : 64,
                              height: isMobile ? 48 : 64,
                              border: `2px solid ${team1Color}`,
                              boxShadow: `0 0 10px ${team1Color}`,
                              mb: 0.5
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: '600',
                              textAlign: 'center',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.2',
                              height: '2.4em',
                              width: '100%'
                            }}
                          >
                            {team1Data.name.split(' (')[0]}
                          </Typography>
                        </Box>
                      )}

                      <Typography
                        variant="h6"
                        sx={{
                          mx: isMobile ? 0 : 1,
                          my: isMobile ? 1 : 0,
                          fontWeight: 'bold',
                          color: theme.palette.text.secondary,
                          fontSize: isMobile ? '1rem' : '1.25rem'
                        }}
                      >
                        VS
                      </Typography>

                      {team2Data && (
                        <Box sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          ml: isMobile ? 0 : 1,
                          mt: isMobile ? 1 : 0,
                          width: isMobile ? '100%' : 'auto'
                        }}>
                          <Avatar
                            src={team2Data.logo}
                            sx={{
                              width: isMobile ? 48 : 64,
                              height: isMobile ? 48 : 64,
                              border: `2px solid ${team2Color}`,
                              boxShadow: `0 0 10px ${team2Color}`,
                              mb: 0.5
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: '600',
                              textAlign: 'center',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.2',
                              height: '2.4em',
                              width: '100%'
                            }}
                          >
                            {team2Data.name.split(' (')[0]}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Match Details */}
                    <Box sx={{
                      background: 'rgba(0,0,0,0.03)',
                      p: isMobile ? 1 : 2,
                      borderRadius: '8px',
                      mb: 2
                    }}>
                      <Typography variant="body2" sx={{
                        color: "text.primary",
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}>
                        <Box component="span" sx={{
                          mr: 1,
                          color: theme.palette.primary.main,
                          fontWeight: '500'
                        }}>
                          Date:
                        </Box>
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>

                      <Typography variant="body2" sx={{
                        color: "text.primary",
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}>
                        <Box component="span" sx={{
                          mr: 1,
                          color: theme.palette.primary.main,
                          fontWeight: '500'
                        }}>
                          Timing:
                        </Box>
                        {convertTo12HourFormat(slot.fromTime)} - {convertTo12HourFormat(slot.toTime)}
                      </Typography>

                      <Typography variant="body2" sx={{
                        color: "text.primary",
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}>
                      
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1
                    }}>
                      <SecondaryButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPackageClick(slot);
                        }}
                        size="small"
                        sx={{
                          flex: 1,
                          background: 'rgba(25, 118, 210, 0.1)',
                          '&:hover': {
                            background: 'rgba(25, 118, 210, 0.2)'
                          },
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          py: isMobile ? 0.5 : 1
                        }}
                      >
                        Add Package
                      </SecondaryButton>
                      <SecondaryButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSlotClick(slot);
                        }}
                        size="small"
                        sx={{
                          flex: 1,
                          background: 'rgba(255, 152, 0, 0.1)',
                          '&:hover': {
                            background: 'rgba(255, 152, 0, 0.2)'
                          },
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          py: isMobile ? 0.5 : 1
                        }}
                      >
                        Edit Slot
                      </SecondaryButton>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </PremiumCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Match Slot Dialog */}
      <Dialog
        open={isAddSlotDialogOpen}
        onClose={() => setIsAddSlotDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `url(${premiumTexture})`,
            backgroundSize: 'cover',
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
          p: 3
        }}>
          <DialogTitle sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            pb: 1
          }}>
            Add New Match Slot
          </DialogTitle>

          <Divider sx={{ mb: 3 }} />

          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontWeight: '500' }}>Team 1</InputLabel>
              <Select
                value={newMatchSlot.team1}
                onChange={(e) => setNewMatchSlot({ ...newMatchSlot, team1: e.target.value, team2: "" })}
                label="Team 1"
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                renderValue={(selected) => {
                  const team = teams.find((t) => t.name === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {team && <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 1 }} />}
                      <Typography>{selected}</Typography>
                    </Box>
                  );
                }}
              >
                {teams.map((team) => (
                  <MenuItem key={team.name} value={team.name}>
                    <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 2 }} />
                    <Typography>{team.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontWeight: '500' }}>Team 2</InputLabel>
              <Select
                value={newMatchSlot.team2}
                onChange={(e) => setNewMatchSlot({ ...newMatchSlot, team2: e.target.value })}
                label="Team 2"
                disabled={!newMatchSlot.team1}
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                renderValue={(selected) => {
                  const team = teams.find((t) => t.name === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {team && <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 1 }} />}
                      <Typography>{selected}</Typography>
                    </Box>
                  );
                }}
              >
                {getAvailableTeams().map((team) => (
                  <MenuItem key={team.name} value={team.name}>
                    <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 2 }} />
                    <Typography>{team.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: '500' }
              }}
              value={newMatchSlot.date}
              onChange={(e) => setNewMatchSlot({ ...newMatchSlot, date: e.target.value })}
              sx={{ mb: 3 }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
              }}
              InputProps={{
                sx: { borderRadius: '8px' }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="From Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: '500' }
                }}
                value={newMatchSlot.fromTime}
                onChange={(e) => setNewMatchSlot({ ...newMatchSlot, fromTime: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
              <TextField
                fullWidth
                label="To Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: '500' }
                }}
                value={newMatchSlot.toTime}
                onChange={(e) => setNewMatchSlot({ ...newMatchSlot, toTime: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <SecondaryButton onClick={() => setIsAddSlotDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <GradientButton
              onClick={handleAddSlot}
              disabled={
                !newMatchSlot.team1 ||
                !newMatchSlot.team2 ||
                !newMatchSlot.date ||
                !newMatchSlot.fromTime ||
                !newMatchSlot.toTime
              }
              sx={{ ml: 2 }}
            >
              Create Slot
            </GradientButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Package Dialog */}
      <Dialog
        open={isAddPackageDialogOpen}
        onClose={() => setIsAddPackageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `url(${premiumTexture})`,
            backgroundSize: 'cover',
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
          p: 3
        }}>
          <DialogTitle sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            pb: 1
          }}>
            Add New Package
          </DialogTitle>

          <Divider sx={{ mb: 3 }} />

          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel 
    sx={{ 
      fontWeight: '500',
      backgroundColor: 'background.paper', // Add background color to prevent cutting
      px: 1, // Add some horizontal padding
      transform: 'translate(14px, -9px) scale(0.75)', // Force the label to be in the small position
      '&.Mui-focused': {
        transform: 'translate(14px, -9px) scale(0.75)' // Keep same when focused
      }
    }}
    shrink={true} // Force the label to always be in the small position
  >
    Package Name
  </InputLabel>
  <Select
    value={newPackage.packageName}
    onChange={(e) => setNewPackage({ ...newPackage, packageName: e.target.value })}
    sx={{ 
      borderRadius: '8px',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '1px !important' // Ensure consistent border width
      }
    }}
    disabled={availablePackagesForSlot.length === 0}
    label="Package Name" // Important for accessibility
    notched // This helps with the label positioning
  >
    {availablePackagesForSlot.length > 0 ? (
      availablePackagesForSlot.map((pkg) => (
        <MenuItem key={pkg.name} value={pkg.name}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              width: 16,
              height: 16,
              background: pkg.color,
              mr: 2,
              borderRadius: '2px'
            }} />
            {pkg.name}
          </Box>
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>
        <Typography color="textSecondary">
          All packages already added for this slot
        </Typography>
      </MenuItem>
    )}
  </Select>
              {availablePackagesForSlot.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  All available package types have already been added to this slot.
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Package Price (₹)"
              type="number"
              value={newPackage.packagePrice}
              onChange={(e) => setNewPackage({ ...newPackage, packagePrice: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: '8px' },
                inputProps: { min: 0 },
                startAdornment: (
                  <Box sx={{
                    color: theme.palette.text.secondary,
                    mr: 1
                  }}>
                    ₹
                  </Box>
                )
              }}
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: '500' }
              }}
              disabled={availablePackagesForSlot.length === 0}
            />

            <TextField
              fullWidth
              label="Seat Count"
              type="number"
              value={newPackage.seatCount}
              onChange={(e) => setNewPackage({ ...newPackage, seatCount: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: '8px' },
                inputProps: { min: 1 }
              }}
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: '500' }
              }}
              disabled={availablePackagesForSlot.length === 0}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: '500' }}>Match Slot</InputLabel>
              <Select
                value={newPackage.slot.slotId}
                onChange={(e) =>
                  setNewPackage({
                    ...newPackage,
                    slot: { slotId: e.target.value },
                  })
                }
                label="Match Slot"
                sx={{ borderRadius: '8px' }}
                disabled
              >
                {selectedSlotForPackage && (
                  <MenuItem value={selectedSlotForPackage.slotId}>
                    {selectedSlotForPackage.team1.split(' (')[0]} vs {selectedSlotForPackage.team2.split(' (')[0]} - {new Date(selectedSlotForPackage.date).toLocaleDateString()}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <SecondaryButton onClick={() => setIsAddPackageDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <GradientButton
              onClick={handleAddPackage}
              disabled={
                !newPackage.packageName ||
                !newPackage.packagePrice ||
                !newPackage.seatCount ||
                !newPackage.slot.slotId ||
                availablePackagesForSlot.length === 0
              }
              sx={{ ml: 2, color: "#fff" }}
            >
              Create Package
            </GradientButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog
        open={isEditSlotDialogOpen}
        onClose={() => setIsEditSlotDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `url(${premiumTexture})`,
            backgroundSize: 'cover',
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
          p: 3
        }}>
          <DialogTitle sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: theme.palette.primary.dark,
            pb: 1
          }}>
            Edit Match Slot
          </DialogTitle>

          <Divider sx={{ mb: 3 }} />

          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontWeight: '500' }}>Team 1</InputLabel>
              <Select
                value={editingSlot.team1}
                onChange={(e) => setEditingSlot({ ...editingSlot, team1: e.target.value, team2: "" })}
                label="Team 1"
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                renderValue={(selected) => {
                  const team = teams.find((t) => t.name === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {team && <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 1 }} />}
                      <Typography>{selected}</Typography>
                    </Box>
                  );
                }}
              >
                {teams.map((team) => (
                  <MenuItem key={team.name} value={team.name}>
                    <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 2 }} />
                    <Typography>{team.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ fontWeight: '500' }}>Team 2</InputLabel>
              <Select
                value={editingSlot.team2}
                onChange={(e) => setEditingSlot({ ...editingSlot, team2: e.target.value })}
                label="Team 2"
                disabled={!editingSlot.team1}
                sx={{
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
                renderValue={(selected) => {
                  const team = teams.find((t) => t.name === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {team && <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 1 }} />}
                      <Typography>{selected}</Typography>
                    </Box>
                  );
                }}
              >
                {teams
                  .filter((team) => team.name !== editingSlot.team1)
                  .map((team) => (
                    <MenuItem key={team.name} value={team.name}>
                      <Avatar src={team.logo} sx={{ width: 28, height: 28, mr: 2 }} />
                      <Typography>{team.name}</Typography>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: '500' }
              }}
              value={editingSlot.slotDate}
              onChange={(e) => setEditingSlot({ ...editingSlot, slotDate: e.target.value })}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: '8px' }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="From Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: '500' }
                }}
                value={editingSlot.slotStart}
                onChange={(e) => setEditingSlot({ ...editingSlot, slotStart: e.target.value })}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
              <TextField
                fullWidth
                label="To Time"
                type="time"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: '500' }
                }}
                value={editingSlot.slotEnd}
                onChange={(e) => setEditingSlot({ ...editingSlot, slotEnd: e.target.value })}
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Box>

         
          </DialogContent>

          <IconButton
            onClick={() => setDeleteConfirmationOpen(true)}
            sx={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)'
              }
            }}
            disabled={editingSlot.slotStatus === "booked"}
          >
            <Delete />
          </IconButton>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <SecondaryButton onClick={() => setIsEditSlotDialogOpen(false)}>
              Cancel
            </SecondaryButton>
            <GradientButton
              onClick={handleUpdateSlot}
              disabled={
                !editingSlot.team1 ||
                !editingSlot.team2 ||
                !editingSlot.slotDate ||
                !editingSlot.slotStart ||
                !editingSlot.slotEnd
              }
              sx={{ ml: 2 }}
            >
              Update Slot
            </GradientButton>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            borderTop: '4px solid ' + theme.palette.error.main
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2
          }}>
            <Avatar sx={{
              bgcolor: theme.palette.error.light,
              width: 60,
              height: 60
            }}>
              <Delete fontSize="large" sx={{ color: theme.palette.error.main }} />
            </Avatar>
          </Box>

          <DialogTitle sx={{
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme.palette.error.main,
            py: 0
          }}>
            Confirm Deletion
          </DialogTitle>

          <DialogContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to delete this match slot?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone and will remove all associated packages.
            </Typography>
          </DialogContent>

          <DialogActions sx={{
            justifyContent: 'center',
            pt: 0,
            pb: 2
          }}>
            <SecondaryButton
              onClick={() => setDeleteConfirmationOpen(false)}
              sx={{
                mr: 2,
                border: '1px solid ' + theme.palette.grey[300]
              }}
            >
              Cancel
            </SecondaryButton>

            <Button
              onClick={handleDeleteSlot}
              variant="contained"
              disabled={isDeleting}
              sx={{
                background: 'linear-gradient(45deg, #d32f2f 0%, #f44336 100%)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #b71c1c 0%, #d32f2f 100%)',
                  boxShadow: '0 4px 8px rgba(244, 67, 54, 0.4)'
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MatchSlots;