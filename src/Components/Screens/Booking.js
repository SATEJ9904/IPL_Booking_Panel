import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
  useTheme,
  useMediaQuery,
  Divider
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';

const SeatBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchSlot } = location.state || {};
  const slotId = matchSlot?.slotId;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const seatContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isTab = useMediaQuery(theme.breakpoints.down("lg"));

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [packages, setPackages] = useState([]);
  const [soldSeats, setSoldSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle mouse down for drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - seatContainerRef.current.offsetLeft);
    setScrollLeft(seatContainerRef.current.scrollLeft);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse move for drag
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - seatContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    seatContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - seatContainerRef.current.offsetLeft);
    setScrollLeft(seatContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - seatContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    seatContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchPackages = async () => {
      if (!slotId) return;

      try {
        const response = await axios.get(
          `https://msfunpark.com/funpark/api/package/getPackagesBySlotId?slotId=${slotId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              'Content-Type': 'application/json'
            }
          },
        );

        const fetchedPackages = response.data;

        setPackages(fetchedPackages);

        const sold = [];
        fetchedPackages.forEach(pkg => {
          pkg.seats.forEach(seat => {
            if (seat.seatStatus !== 'AVAILABLE') {
              sold.push(seat.seatNumber);
            }
          });
        });
        setSoldSeats(sold);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to load seat data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPackages();
  }, [slotId]);

  const toggleSeatSelection = (seatNumber) => {
    if (soldSeats.includes(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const calculateTotalAmount = () => {
    let total = 0;
    selectedSeats.forEach((seatNumber) => {
      const packageForSeat = packages.find(pkg =>
        pkg.seats.some(seat => seat.seatNumber === seatNumber)
      );
      if (packageForSeat) {
        total += packageForSeat.packages.packagePrice;
      }
    });
    return total;
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) return;

    const seatDetails = selectedSeats.map((seatNumber) => {
      const packageForSeat = packages.find(pkg =>
        pkg.seats.some(seat => seat.seatNumber === seatNumber)
      );
      const seatObj = packageForSeat?.seats?.find(seat => seat.seatNumber === seatNumber);

      let seatPrefix = '';
      if (packageForSeat) {
        if (packageForSeat.packages.packageName === 'Platinum') seatPrefix = 'P';
        else if (packageForSeat.packages.packageName === 'Gold') seatPrefix = 'G';
        else if (packageForSeat.packages.packageName === 'Silver') seatPrefix = 'S';
        else if (packageForSeat.packages.packageName === 'VVIP') seatPrefix = 'V';
      }

      const seatNum = seatNumber.slice(1);

      return {
        seatNumber: `${seatPrefix}${seatNum}`,
        originalSeatNumber: seatNumber,
        seatId: seatObj?.seatId || '',
        packageName: packageForSeat?.packages?.packageName || '',
        packageId: packageForSeat?.packages?.packageId || '',
        price: packageForSeat?.packages?.packagePrice || 0
      };
    });

    const orderDetails = {
      matchSlot,
      slotId,
      seats: seatDetails,
      total: calculateTotalAmount(),
      seatDetails: seatDetails
    };

    navigate('/PaymentPage', { state: { order: orderDetails } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const organizeSeatsByCategory = () => {
    const organized = {
      Platinum: { price: 0, rows: {} },
      Gold: { price: 0, rows: {} },
      Silver: { price: 0, rows: {} },
      VVIP: { price: 0, rows: {} }
    };

    packages.forEach(pkg => {
      const category = pkg.packages.packageName;
      const price = pkg.packages.packagePrice;

      if (!organized[category]) {
        organized[category] = { price, rows: {} };
      } else {
        organized[category].price = price;
      }

      const sortedSeats = [...pkg.seats].sort((a, b) => {
        return a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true });
      });

      let seatIndex = 0;

      if (category === 'Platinum') {
        // Platinum rows arrangement
        const rowConfigs = [
          { letter: 'A', size: 27, gaps: [3, 6, 9, 12, 15, 18, 21, 24, 27] },  // 27 seats with gap after 3 seats
          { letter: 'B', size: 21, gaps: [3, 6, 9, 12, 15, 18, 21, 24] },  // 21 seats with gap after 3 seats
          { letter: 'C', size: 21, gaps: [3, 6, 9, 12, 15, 18, 21, 24] },  // 21 seats with gap after 3 seats
          { letter: 'D', size: 27, gaps: [3, 6, 9, 12, 15, 18, 21, 24, 27] }   // 27 seats with gap after 3 seats
        ];

        for (const config of rowConfigs) {
          organized[category].rows[config.letter] = [];
          let gapCount = 0;

          for (let j = 0; j < config.size && seatIndex < sortedSeats.length; j++) {
            organized[category].rows[config.letter].push(sortedSeats[seatIndex]);
            seatIndex++;

            // Add gap if needed
            if (config.gaps.includes(j + 1)) {
              organized[category].rows[config.letter].push(null); // null represents a gap
            }
          }
        }
      } else if (category === 'Gold' || category === 'Silver') {
        // Gold and Silver rows arrangement - 20 seats per row with gaps
        const gaps = [3, 7, 13, 17]; // Positions after which to add gaps

        let rowCount = 0;
        while (seatIndex < sortedSeats.length) {
          const rowLetter = String.fromCharCode(65 + rowCount);
          organized[category].rows[rowLetter] = [];

          for (let j = 0; j < 20 && seatIndex < sortedSeats.length; j++) {
            organized[category].rows[rowLetter].push(sortedSeats[seatIndex]);
            seatIndex++;

            // Add gap if needed
            if (gaps.includes(j + 1)) {
              organized[category].rows[rowLetter].push(null); // null represents a gap
            }
          }

          rowCount++;
        }
      } else if (category === 'VVIP') {
        // VVIP seats - 6 left and 6 right with a large gap in between
        const leftSeats = sortedSeats.slice(0, 6);
        const rightSeats = sortedSeats.slice(6, 12);

        organized[category].rows['A'] = [
          ...leftSeats,
          null, // Large gap
          ...rightSeats
        ];
      }
    });

    return organized;
  };

  const seatCategories = organizeSeatsByCategory();

  const getSeatStyle = (seat, category) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isSold = seat.seatStatus !== 'AVAILABLE';
    const isVvip = category === 'VVIP';

    let bgColor = '#bdbdbd';
    if (isSold) bgColor = '#ff0000';
    else if (isSelected) bgColor = '#4caf50';
    else if (isVvip) bgColor = '#ffd700';

    return {
      minWidth: isMobile ? 24 : 30,
      minHeight: isMobile ? 24 : 30,
      fontSize: isMobile ? 10 : 12,
      fontWeight: "bold",
      borderRadius: "4px",
      margin: isMobile ? '0 2px' : '0 4px',
      padding: 0,
      backgroundColor: bgColor,
      color: isVvip ? '#000' : '#fff',
      '&:hover': {
        backgroundColor: isSold
          ? '#ff0000'
          : isSelected
            ? '#388e3c'
            : isVvip
              ? '#ffc400'
              : '#9e9e9e',
      }
    };
  };

  const formatTo12Hour = (timeString) => {
    if (!timeString) return '';

    // Extract hours and minutes
    const [hours, minutes] = timeString.split(':');
    const hourInt = parseInt(hours, 10);

    // Determine AM/PM
    const period = hourInt >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const twelveHour = hourInt % 12 || 12;

    // Return formatted time
    return `${twelveHour}:${minutes} ${period}`;
  };

  const renderSeatRow = (seats, category, isVvip = false) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          minWidth: 'max-content',
          py: 0,
          userSelect: 'none'
        }}
      >
        {seats.map((seat, index) => {
          if (seat === null) {
            // Render a gap
            return (
              <Box
                key={`gap-${index}`}
                sx={{
                  width: isVvip ? (isMobile ? 40 : 60) : (isMobile ? 12 : 14),
                  height: isMobile ? 24 : 30
                }}
              />
            );
          }

          return (
            <Button
              key={seat.seatNumber}
              variant="contained"
              size="small"
              onClick={() => toggleSeatSelection(seat.seatNumber)}
              sx={getSeatStyle(seat, category)}
            >
              {seat.seatNumber.slice(1)}
            </Button>
          );
        })}
      </Box>
    );
  };

  const renderPlatinumSeats = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={15} sx={{ fontWeight: "bold", mb: 1 }}>
          Platinum (₹{seatCategories.Platinum.price})
        </Typography>

        {/* Row A - 27 seats */}
        {seatCategories.Platinum.rows.A && (
          <Box sx={{ mb: 1 }}>
            {renderSeatRow(seatCategories.Platinum.rows.A, 'Platinum')}
          </Box>
        )}

        {/* Row B - 21 seats */}
        {seatCategories.Platinum.rows.B && (
          <Box sx={{ mb: 1, ml: isMobile ? "22%" : isTab ? "15%" : undefined }}>
            {renderSeatRow(seatCategories.Platinum.rows.B, 'Platinum')}
          </Box>
        )}

        {/* Row C - 21 seats */}
        {seatCategories.Platinum.rows.C && (
          <Box sx={{ mb: 1, ml: isMobile ? "22%" : isTab ? "15%" : undefined }}>
            {renderSeatRow(seatCategories.Platinum.rows.C, 'Platinum')}
          </Box>
        )}

        {/* Row D - 27 seats */}
        {seatCategories.Platinum.rows.D && (
          <Box sx={{ mb: 1 }}>
            {renderSeatRow(seatCategories.Platinum.rows.D, 'Platinum')}
          </Box>
        )}
      </Box>
    );
  };

  const renderVvipSeats = () => {
    if (!seatCategories.VVIP || !seatCategories.VVIP.rows.A) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography fontSize={15} sx={{ fontWeight: "bold", mb: 1 }}>
          VVIP (₹{seatCategories.VVIP.price})
        </Typography>

        {/* VVIP Seats - 6 left, large gap, 6 right */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 1
        }}>
          {renderSeatRow(seatCategories.VVIP.rows.A, 'VVIP', true)}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 8,
        pb: selectedSeats.length > 0 ? 10 : 0,
        overflow: 'hidden'
      }}
    >
      <AppBar position="fixed" sx={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          {matchSlot && (
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {matchSlot.team1} vs {matchSlot.team2}
              </Typography>
              <Typography variant="body2">
                {matchSlot.date} | {formatTo12Hour(matchSlot.fromTime)} - {formatTo12Hour(matchSlot.toTime)}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h6">Loading seat data...</Typography>
        </Box>
      ) : (
        <Box
          ref={seatContainerRef}
          sx={{
            width: "100%",
            mt: 1,
            textAlign: "center",
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            pb: 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            '&:active': {
              cursor: 'grabbing'
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Box sx={{
            width: isMobile ? '100%' : '100%',
            mx: 'auto',
            px: isMobile ? 1 : 2,
            transform: 'translateX(0)',
            transition: 'transform 0.1s ease'
          }}>
            {/* Screen Block */}
            <Typography
              fontSize={12}
              sx={{
                backgroundColor: "#1e3a8a",
                color: "white",
                fontWeight: "bold",
                p: 0.5,
                width: isMobile ? "150%" : "60%",
                borderRadius: "5px",
                mx: "auto",
                mb: 2,
                ml: isMobile ? "15%" : null,
              }}
            >
              SCREEN
            </Typography>

            {/* VVIP Section */}
            {seatCategories.VVIP && renderVvipSeats()}

            {/* Platinum Section */}
            {seatCategories.Platinum && renderPlatinumSeats()}

            {/* Gold Section */}
            {seatCategories.Gold && (
              <Box sx={{ mb: 2 }}>
                <Typography fontSize={15} sx={{ fontWeight: "bold", mb: 1 }}>
                  Gold (₹{seatCategories.Gold.price})
                </Typography>
                {Object.entries(seatCategories.Gold.rows).map(([rowLetter, seats]) => (
                  <Box key={`Gold-${rowLetter}`} sx={{ mb: 1 }}>
                    {renderSeatRow(seats, 'Gold')}
                  </Box>
                ))}
              </Box>
            )}

            {/* Silver Section */}
            {seatCategories.Silver && (
              <Box sx={{ mb: 0 }}>
                <Typography fontSize={15} sx={{ fontWeight: "bold", mb: 1 }}>
                  Silver (₹{seatCategories.Silver.price})
                </Typography>
                {Object.entries(seatCategories.Silver.rows).map(([rowLetter, seats]) => (
                  <Box key={`Silver-${rowLetter}`} sx={{ mb: 1 }}>
                    {renderSeatRow(seats, 'Silver')}
                  </Box>
                ))}
              </Box>
            )}

            {/* Seat Legend */}
            <Paper elevation={3} sx={{
              p: 2,
              mt: 2,
              mx: 'auto',
              maxWidth: isMobile ? '90%' : 500,
              backgroundColor: 'background.paper'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Seat Legend
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2} justifyContent="center">
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#bdbdbd',
                    mr: 1,
                    borderRadius: '4px'
                  }} />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? 12 : 14 }}>Available</Typography>
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#4caf50',
                    mr: 1,
                    borderRadius: '4px'
                  }} />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? 12 : 14 }}>Selected</Typography>
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#ff0000',
                    mr: 1,
                    borderRadius: '4px'
                  }} />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? 12 : 14 }}>Sold</Typography>
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: '#ffd700',
                    mr: 1,
                    borderRadius: '4px'
                  }} />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? 12 : 14 }}>VVIP</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      )}

      {selectedSeats.length > 0 ? (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            p: 2,
            textAlign: "center",
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: isMobile ? "15%" : isTab ? "10%" : null
          }}
        >
          <Button
            component={Link}
            to="/GetBookings"
            state={{ slotId }}
            variant="outlined"
            color="secondary"
            sx={{
              fontWeight: "bold",
              width: "30%",
              maxWidth: 200,
              py: 1.5,
              fontSize: 14,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: '#ccc',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            View Bookings
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontWeight: "bold",
              width: "50%",
              maxWidth: 400,
              py: 1.5,
              fontSize: 16,
              background: 'linear-gradient(45deg, #1E3A8A 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1E3A8A 0%, #2563EB 70%)',
              }
            }}
            onClick={handleBooking}
          >
            Book {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} (₹{calculateTotalAmount()})
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              position: "fixed",
              bottom: 20,
              left: 20,
              zIndex: 1000
            }}
          >
            <Button
              component={Link}
              to="/GetBookings"
              state={{ slotId }}
              variant="contained"
              color="secondary"
              sx={{
                fontWeight: "bold",
                py: 1.5,
                fontSize: 14,
                minWidth: 180,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              View Bookings
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SeatBooking;