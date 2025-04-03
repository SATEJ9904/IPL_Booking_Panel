import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Badge,
  IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useLocation, useNavigate } from "react-router-dom";

// Import team logos
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

// Team data with logos
const teams = [
  { name: "Chennai Super Kings (CSK)", logo: CSK, short: "CSK", primaryColor: "#fdb913", secondaryColor: "#005db0" },
  { name: "Delhi Capitals (DC)", logo: DC, short: "DC", primaryColor: "#004c93", secondaryColor: "#1a8fd8" },
  { name: "Gujarat Titans (GT)", logo: GT, short: "GT", primaryColor: "#5c88da", secondaryColor: "#f76e11" },
  { name: "Kolkata Knight Riders (KKR)", logo: KKR, short: "KKR", primaryColor: "#3a225d", secondaryColor: "#f9a01b" },
  { name: "Mumbai Indians (MI)", logo: MI, short: "MI", primaryColor: "#005da0", secondaryColor: "#d1ab3e" },
  { name: "Punjab Kings (PBKS)", logo: PBKS, short: "PBKS", primaryColor: "#aa4545", secondaryColor: "#f5e51b" },
  { name: "Rajasthan Royals (RR)", logo: RR, short: "RR", primaryColor: "#2d4d9d", secondaryColor: "#e73895" },
  { name: "Royal Challengers Bangalore (RCB)", logo: RCB, short: "RCB", primaryColor: "#000000", secondaryColor: "#ec1c24" },
  { name: "Sunrisers Hyderabad (SRH)", logo: SRH, short: "SRH", primaryColor: "#f8aa1b", secondaryColor: "#000000" },
  { name: "Lucknow Super Giants (LSG)", logo: LSG, short: "LSG", primaryColor: "#00a3ad", secondaryColor: "#ffed00" },
];

const PaymentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("gpay");
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const location = useLocation();
  const { order } = location.state || {};

  // Validate phone number
  const validatePhoneNumber = (number) => {
    if (!number) return "Mobile number is required";
    if (!/^\d+$/.test(number)) return "Only digits are allowed";
    if (number.length !== 10) return "Mobile number must be 10 digits";
    return "";
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError(validatePhoneNumber(value));
  };

  // Check if form is valid
  const isFormValid = () => {
    return customerName && phoneNumber && !phoneError;
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (!order) {
      setSnackbar({
        open: true,
        message: "No order details available. Please go back and try again.",
        severity: "error",
      });
    }
  }, [order]);

  if (!order) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">No order details available. Please go back and try again.</Typography>
      </Box>
    );
  }

  // Extract all order data
  const { matchSlot, seats = [], total = 0, seatDetails = [] } = order;
  const { team1, team2, date, fromTime, toTime, venue, slotId } = matchSlot || {};

  // Get team data
  const team1Data = teams.find(t => team1.includes(t.short)) || {};
  const team2Data = teams.find(t => team2.includes(t.short)) || {};

  // Group seats by package for better display
  const seatsByPackage = seatDetails.reduce((acc, seat) => {
    if (!acc[seat.packageName]) {
      acc[seat.packageName] = [];
    }
    acc[seat.packageName].push(seat);
    return acc;
  }, {});

  // Prepare data for API submission
  const prepareBookingData = () => {
    const seatIds = seatDetails.map(seat => seat.seatId);
    const packageIds = [...new Set(seatDetails.map(seat => seat.packageId))];
    return {
      customer: {
        username: customerName,
        contact: phoneNumber,
      },
      seats: seatIds.map(seatId => ({ seatId })),
      packages: packageIds.map(packageId => ({ packageId })),
      slot: {
        slotId: slotId
      }
    };
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);

    try {
      const bookingData = prepareBookingData();

      const response = await fetch(
        "https://msfunpark.com/funpark/api/booking/save-booking",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save booking: ${errorText}`);
      }

      const result = await response.json();

      setSnackbar({
        open: true,
        message: "Booking confirmed successfully!",
        severity: "success",
      });

      setOpenPrintDialog(true);
      handleNext();
    } catch (error) {
      console.error("Error saving booking:", error.message);
      setSnackbar({
        open: true,
        message: "Failed to save booking. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = async () => {
    setIsPrinting(true);
    try {
      // Create the print content HTML string
      const printContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>FunPark Ticket</title>
    <style>
      @page {
        size: 5cm 13.7cm;
        margin: 0;
      }
      body {
        font-family: 'Roboto', sans-serif;
        margin: 0;
        padding: 0;
        width: 5cm;
        height: 13.7cm;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-size: 9px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .header {
        text-align: center;
        margin-bottom: 2px;
        font-weight: bold;
        color: #000;
      }
      .title {
        background-color: white;
        color:rgb(0, 0, 0);
        padding: 8px;
        text-align: center;
        font-weight: 600;
        margin-bottom: 7%;
        font-size: 10px;
      }
      .match-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 4px;
        font-weight: bold;
      }
      .vs {
        color:rgb(0, 0, 0);
        font-weight: bold;
      }
      .customer-info {
        padding: 8px 4px 4px 4px;
        border-radius: 4px;
        margin-bottom: 4px;
      }
      .section-title {
        font-weight: bold;
        margin-bottom: 1px;
      }
      .ticket-section {
        margin-bottom: 4px;
      }
      .package-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      .seats-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 2px;
        max-height: 60px;
        overflow-y: auto;
      }
      .seat {
        background-color: #f0f0f0;
        padding: 0 4px;
        border-radius: 2px;
        font-size: 12px;
        font-weight: 600;
      }
      .payment-summary {
        padding: 4px;
        background-color: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 4px;
      }
      .payment-title {
        font-weight: bold;
        margin-bottom: 12px;
      }
      .footer {
        text-align: center;
      }
      .venue {
        font-weight: 500;
        display: block;
      }
      .contact {
        display: block;
        margin-top: 2px;
      }
      .thank-you {
        display: block;
        margin-top: 25px;
      }
      .bold {
        font-weight: bold;
      }
      .medium {
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <h1 class="title">FUNPARK TICKET</h1>
    
    <div class="header">
      ${formatDate(date)} | ${formatTime(fromTime)}
    </div>
    
    <div class="match-info">
      <span class="bold">${team1Data.short}</span>
      <span class="vs">VS</span>
      <span class="bold">${team2Data.short}</span>
    </div>
    
    <div class="customer-info">
      <div class="section-title">CUSTOMER INFORMATION</div>
      <div><span class="bold">Name:</span> ${customerName}</div>
      <div style="margin-top: 2px"><span class="bold">Phone:</span> +91 ${phoneNumber}</div>
    </div>
    
    <div class="ticket-section">
      <div class="section-title">TICKET DETAILS:</div>
      ${Object.entries(seatsByPackage).map(([packageName, packageSeats]) =>
        `<div>
          <div class="package-row">
            <span>${packageName} (${packageSeats.length})</span>
            <span class="medium">₹${(packageSeats[0].price * packageSeats.length).toLocaleString('en-IN')}</span>
          </div>
          <div class="seats-container">
            ${packageSeats.map(seat =>
          `<div class="seat">${seat.seatNumber}</div>`
        ).join('')}
          </div>
        </div>`
      ).join('')}
    </div>
    
    <div class="payment-summary">
      <div class="payment-title">PAYMENT SUMMARY</div>
      <div class="package-row">
        <span>Subtotal:</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>
      <div class="package-row" style="margin-top: 2px">
        <span>Total Amount:</span>
        <span class="bold">₹${total.toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <div class="footer">
      <span class="venue">VENUE: Near Alliance Hospital, Magdum Nagar, Ichalkaranji</span>
      <span class="contact">CONTACT: +91 7030009494</span>
      <span class="thank-you">Thank you for your booking!</span>
    </div>
  </body>
</html>
      `;

      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '5cm';
      iframe.style.height = '13.7cm';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Wait for content to load
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 200); // Fallback timeout
      });

      // Focus and print
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

    } catch (error) {
      console.error("Printing failed:", error);
      // Fallback to basic window print
      window.print();
    } finally {
      setIsPrinting(false);
      setOpenPrintDialog(false);
      navigate(-1)
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString) => {
    return timeString?.replace(/:00$/, '') || '';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const steps = ['Customer Details', 'Payment Method', 'Confirmation'];

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "#f9f9f9", 
      pt: isMobile ? 2 : 4,
      pb: isMobile ? 10 : 4
    }}>
      <Container maxWidth="lg" sx={{ px: isMobile ? 1 : 3 }}>
        {/* Header with back button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: isMobile ? 2 : 3,
          position: 'relative'
        }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              mr: 2,
              color: 'primary.main',
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="primary.main">
            Complete Your Booking
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel 
          sx={{ 
            mb: isMobile ? 3 : 4,
            px: isMobile ? 0 : 2
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel 
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                    fontWeight: 500
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={isMobile ? 1 : 3} justifyContent="center">
          {/* Left Section - Payment Form */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: "white",
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              {activeStep === 0 && (
                <Box>
                  {/* Contact Details */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                    p: 2,
                    borderRadius: 2
                  }}>
                    <ContactPhoneIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={isMobile ? 1 : 2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        variant="outlined"
                        size="small"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        sx={{ mb: isMobile ? 1.5 : undefined }}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        variant="outlined"
                        size="small"
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
                        required
                        error={!!phoneError}
                        helperText={phoneError}
                        sx={{ mb: isMobile ? 1.5 : undefined }}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isFormValid()}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        boxShadow: 'none',
                        textTransform: 'none'
                      }}
                    >
                      Continue to Payment
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  {/* Payment Options */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                    p: 2,
                    borderRadius: 2
                  }}>
                    <PaymentIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="600" color="primary.main">
                      Payment Method
                    </Typography>
                  </Box>
                  
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{ gap: 2 }}
                  >
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: paymentMethod === 'gpay' ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
                      bgcolor: paymentMethod === 'gpay' ? 'rgba(25, 118, 210, 0.05)' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: paymentMethod === 'gpay' ? '#1976d2' : 'rgba(0,0,0,0.2)'
                      }
                    }}>
                      <FormControlLabel
                        value="gpay"
                        control={<Radio color="primary" />}
                        label={
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src="https://storage.googleapis.com/a1aa/image/qfk49DctC3CpSpucXKuzJ4Idh-ponQbrxALV6ge8vqg.jpg"
                              sx={{ width: 28, height: 28, mr: 2 }}
                            />
                            <Typography fontWeight="500">Google Pay</Typography>
                          </Box>
                        }
                      />
                    </Paper>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: paymentMethod === 'cash' ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
                      bgcolor: paymentMethod === 'cash' ? 'rgba(25, 118, 210, 0.05)' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: paymentMethod === 'cash' ? '#1976d2' : 'rgba(0,0,0,0.2)'
                      }
                    }}>
                      <FormControlLabel
                        value="cash"
                        control={<Radio color="primary" />}
                        label={
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src="https://storage.googleapis.com/a1aa/image/k-3tolxjp8k0-22tEGfn67o5O1AWC171uWarsu4fiao.jpg"
                              sx={{ width: 28, height: 28, mr: 2 }}
                            />
                            <Typography fontWeight="500">Cash Payment</Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      sx={{
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        boxShadow: 'none',
                        textTransform: 'none'
                      }}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}>
                    <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Booking Confirmed!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Your tickets have been successfully booked. You can print your receipt now.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintReceipt}
                    disabled={isPrinting}
                    sx={{
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      boxShadow: 'none',
                      textTransform: 'none'
                    }}
                  >
                    {isPrinting ? 'Printing...' : 'Print Receipt'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Section - Order Summary */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: "white",
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              position: isMobile ? undefined : 'sticky',
              top: isMobile ? undefined : 20
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Badge badgeContent={seats.length} color="primary" sx={{ mr: 1.5 }} />
                Order Summary
              </Typography>

              {/* Match Info */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3,
                p: 2,
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}>
                <Box sx={{ textAlign: 'center', mr: 2 }}>
                  <Avatar
                    src={team1Data.logo}
                    sx={{
                      width: isMobile ? 48 : 56,
                      height: isMobile ? 48 : 56,
                      border: `2px solid ${team1Data.primaryColor || '#ddd'}`,
                      bgcolor: 'white',
                      mx: 'auto'
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                    {team1Data.short}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  mx: 2,
                  px: 2,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.8rem' : '1rem'
                }}>
                  VS
                </Box>
                
                <Box sx={{ textAlign: 'center', ml: 2 }}>
                  <Avatar
                    src={team2Data.logo}
                    sx={{
                      width: isMobile ? 48 : 56,
                      height: isMobile ? 48 : 56,
                      border: `2px solid ${team2Data.primaryColor || '#ddd'}`,
                      bgcolor: 'white',
                      mx: 'auto'
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                    {team2Data.short}
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {team1} vs {team2}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(date)} • {formatTime(fromTime)} - {formatTime(toTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {venue || "Stadium Venue"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Seat Details */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ticket Details
              </Typography>

              {Object.entries(seatsByPackage).map(([packageName, packageSeats]) => (
                <Box key={packageName} mb={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Chip
                      label={packageName}
                      size="small"
                      sx={{
                        mr: 1,
                        bgcolor: packageName === 'Platinum' ? '#e5e4e2' :
                          packageName === 'Gold' ? '#ffd700' : '#c0c0c0',
                        fontWeight: 'bold',
                        color: packageName === 'Gold' ? 'rgba(0,0,0,0.8)' : 'inherit'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {packageSeats.length} ticket{packageSeats.length > 1 ? 's' : ''} • ₹{packageSeats[0].price}/ticket
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {packageSeats.map((seat, index) => (
                      <Chip
                        key={index}
                        label={seat.seatNumber}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: packageName === 'Platinum' ? '#e5e4e2' :
                            packageName === 'Gold' ? '#ffd700' : '#c0c0c0',
                          color: 'text.primary',
                          fontWeight: 'medium'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Payment Summary */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Convenience Fee:</Typography>
                  <Typography variant="body2">₹0</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2">Taxes:</Typography>
                  <Typography variant="body2">₹0</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Receipt Dialog */}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: isMobile ? '90vw' : '6cm',
            maxHeight: isMobile ? '90vh' : '14.5cm',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'white',
          color: 'primary.main',
          p: '8px',
          textAlign: 'center',
          fontWeight: "600",
          mb: "7%",
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant={isMobile ? "body1" : "subtitle2"} fontWeight="bold">
            FUNPARK TICKET
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          p: 0,
          height: isMobile ? '70vh' : '12.5cm',
          overflow: 'auto',
          margin:"0.4cm"
        }}>
          {/* Receipt Container */}
          <Box
            id="receipt-to-print"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: isMobile ? '12px' : '9px',
              width: '100%',
              height: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              p: isMobile ? 2 : 0
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: '2px' }}>
              <Typography variant="caption" color="#000" fontWeight={"600"}>
                {formatDate(date)} | {formatTime(fromTime)}
              </Typography>
            </Box>

            {/* Match Info */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: '4px',
              borderRadius: '4px',
              mb: '4px'
            }}>
              <Typography variant="caption" fontWeight="bold">
                {team1Data.short}
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary.main">
                VS
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {team2Data.short}
              </Typography>
            </Box>

            {/* Customer Info */}
            <Box sx={{
              pt: "8px",
              p: '4px',
              borderRadius: '4px',
              mb: '4px'
            }}>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: '1px' }}>
                CUSTOMER INFORMATION
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Name:</strong> {customerName}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: '2px' }}>
                <strong>Phone:</strong> +91 {phoneNumber}
              </Typography>
            </Box>

            {/* Ticket Details */}
            <Box sx={{ mb: '4px' }}>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: '2px' }}>
                TICKET DETAILS:
              </Typography>

              {Object.entries(seatsByPackage).map(([packageName, packageSeats]) => (
                <Box key={packageName} sx={{ mb: '4px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">
                      {packageName} ({packageSeats.length})
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      ₹{(packageSeats[0].price * packageSeats.length).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2px',
                    mt: '2px',
                    maxHeight: isMobile ? 'none' : '60px',
                    overflowY: isMobile ? 'visible' : 'auto'
                  }}>
                    {packageSeats.map((seat, index) => (
                      <Box key={index} sx={{
                        bgcolor: '#f0f0f0',
                        p: '0 4px',
                        borderRadius: '2px',
                        fontSize: isMobile ? '14px' : '12px',
                        fontWeight: "600"
                      }}>
                        {seat.seatNumber}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Payment Summary */}
            <Box sx={{
              p: '4px',
              borderRadius: '4px',
              mb: '4px'
            }}>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: '12px' }}>
                PAYMENT SUMMARY
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Subtotal:</Typography>
                <Typography variant="caption">₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '2px' }}>
                <Typography variant="caption">Total Amount:</Typography>
                <Typography variant="caption" fontWeight="bold">
                  ₹{total.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 0 }}>
              <Typography variant="caption" display="block" fontWeight="medium">
                VENUE: Near Alliance Hospital, Magdum Nagar, Ichalkaranji
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: '2px' }}>
                CONTACT: +91 7030009494
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: '25px' }}>
                Thank you for your booking!
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: "12px",
            justifyContent: "center",
            borderTop: "1px solid #eee",
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            onClick={() => {
              setSnackbar({
                open: true,
                message: "Booking confirmed successfully!",
                severity: "success",
              });
              setOpenPrintDialog(false);
              navigate(-1)}}
            size="medium"
            variant="outlined"
            sx={{
              fontSize: isMobile ? "14px" : "12px",
              minWidth: isMobile ? "100px" : "90px",
              p: "6px 12px",
              borderRadius: 2,
              mr: 2,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrintReceipt}
            variant="contained"
            size="medium"
            startIcon={<PrintIcon sx={{ fontSize: isMobile ? "18px" : "16px" }} />}
            disabled={isPrinting}
            sx={{
              fontSize: isMobile ? "14px" : "12px",
              minWidth: isMobile ? "120px" : "110px",
              p: "6px 12px",
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {isPrinting ? "Printing..." : "Print"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            alignItems: 'center'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentPage;