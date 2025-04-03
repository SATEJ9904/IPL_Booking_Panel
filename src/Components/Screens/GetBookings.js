import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const BookingContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f3f5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:before {
    content: '';
    display: block;
    width: 8px;
    height: 2rem;
    background: #4e54c8;
    border-radius: 4px;
  }
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  width: 300px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4e54c8;
    box-shadow: 0 0 0 2px rgba(78, 84, 200, 0.2);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1.5rem;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  &:first-child {
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  &:hover {
    background-color: #f1f3ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f1f3f5;
  color: #555;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #e3fcef;
  color: #0a8150;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 1.5rem;
`;

function GetBookings() {
  const location = useLocation();
  const { slotId } = location.state || {};
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [filteredGroupedBookings, setFilteredGroupedBookings] = useState([]);


  const handlePrintClick = (booking, e) => {
    e.stopPropagation(); // Prevent the row click from triggering
    setSelectedBooking(booking);
    setOpenPrintDialog(true);
  };

  const extractTeamNames = (slotName) => {
    if (!slotName) return { team1: '', team2: '' };
    const matches = slotName.match(/\((.*?)\)/g);
    if (!matches || matches.length < 2) return { team1: '', team2: '' };
    return {
      team1: matches[0].replace(/[()]/g, ''),
      team2: matches[1].replace(/[()]/g, '')
    };
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5); // Returns "HH:MM" format
  };

  const handlePrintReceipt = async () => {
    const { team1, team2 } = extractTeamNames(selectedBooking.packages[0]?.slot?.slotName || '');
    const matchInfo = team1 && team2 ? `${team1} vs ${team2}` : 'Match Info';

    setIsPrinting(true);
    try {
      // Create a printable HTML string for the thermal printer
      const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FunPark Ticket</title>
        <style>
          @page {
            size: 5cm auto;
            margin: 0;
          }
          body {
            font-family: 'Roboto', sans-serif;
            width: 5cm;
            padding: 2mm;
            font-size: 9px;
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            text-align: center;
            font-weight: bold;
            margin-bottom: 2px;
            font-size: 10px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          .section-title {
            font-weight: bold;
            margin: 2px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .center {
            text-align: center;
            margin-bottom: 2px;
          }
          .footer {
            margin-top: 10px;
            text-align: center;
          }
          .match-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 4px;
          }
          .info-box {
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 4px;
          }
          .seat-box {
            background-color: #f0f0f0;
            padding: 0 4px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 2px;
            margin-bottom: 2px;
            display: inline-block;
          }
          .bold {
            font-weight: bold;
          }
          .medium {
            font-weight: 500;
          }
          .vs {
            color:rgb(0, 0, 0);
            font-weight: bold;
          }
          .seats-container {
            display: flex;
            flex-wrap: wrap;
            gap: 2px;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <h1 class="header">FUNPARK TICKET</h1>
        
        <div class="center">
          ${formatDate(selectedBooking.packages[0]?.slot?.slotDate)} | ${formatTime(selectedBooking.packages[0]?.slot?.slotStart)}
        </div>
        
        <div class="match-info">
          <span class="bold">${team1}</span>
          <span class="vs">VS</span>
          <span class="bold">${team2}</span>
        </div>
        
        <div class="info-box">
          <div class="section-title">CUSTOMER INFORMATION</div>
          <div><strong>Name:</strong> ${selectedBooking.customer?.username || 'N/A'}</div>
          <div style="margin-top: 2px;"><strong>Phone:</strong> +91 ${selectedBooking.customer?.contact || 'N/A'}</div>
        </div>
        
        <div style="margin-bottom: 4px;">
          <div class="section-title">TICKET DETAILS:</div>
          <div class="row">
            <span>${selectedBooking.packages[0]?.packageName} (${selectedBooking.seatCount})</span>
            <span class="medium">₹${(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}</span>
          </div>
          <div class="seats-container">
            ${selectedBooking.seats?.map(seat => `<span class="seat-box">${seat}</span>`).join('')}
          </div>
        </div>
        
        <div class="info-box">
          <div class="section-title" style="margin-bottom: 12px;">PAYMENT SUMMARY</div>
          <div class="row">
            <span>Subtotal:</span>
            <span>₹${(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}</span>
          </div>
          <div class="row" style="margin-top: 2px;">
            <span>Total Amount:</span>
            <span class="bold">₹${(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="medium">VENUE: Near Alliance Hospital, Magdum Nagar, Ichalkaranji</div>
          <div style="margin-top: 2px;">CONTACT: +91 7030009494</div>
          <div style="margin-top: 25px;">Thank you for your booking!</div>
        </div>
      </body>
      </html>
      `;

      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsPrinting(false);
          setOpenPrintDialog(false);
          toast.success('Receipt sent to printer');
        }, 200);
      };
    } catch (error) {
      console.error('Printing error:', error);
      toast.error('Failed to print receipt');
      setIsPrinting(false);
    }
  };


  useEffect(() => {
    if (!slotId) {
      toast.error("No slot ID provided");
      return;
    }

    const fetchPackagesForSlot = async () => {
      try {
        const response = await fetch(
          `https://msfunpark.com/funpark/api/booking/getBooking?slotId=${slotId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "Content-Type": "application/json"
            },
          }
        );

        const data = await response.json();
       // console.log(data)
        setBookings(data);
        setFilteredBookings(data);

        // Group bookings by contact number
        const grouped = data.reduce((acc, booking) => {
          const contact = booking.customer.contact;
          if (!acc[contact]) {
            acc[contact] = {
              ...booking,
              seatCount: 1,
              seats: booking.seat.map(s => s.seatNumber),
              bookingIds: [booking.bookingId]
            };
          } else {
            acc[contact].seatCount += 1;
            acc[contact].seats = [...acc[contact].seats, ...booking.seat.map(s => s.seatNumber)];
            acc[contact].bookingIds.push(booking.bookingId);
          }
          return acc;
        }, {});

        setGroupedBookings(Object.values(grouped));
        setFilteredGroupedBookings(Object.values(grouped));
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch bookings");
      }
    };

    fetchPackagesForSlot();
  }, [slotId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGroupedBookings(groupedBookings);
    } else {
      const filtered = groupedBookings.filter(booking =>
        booking.customer.contact.includes(searchTerm) ||
        booking.customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingIds.some(id => id.toString().includes(searchTerm))

      );
      setFilteredGroupedBookings(filtered);
    }
  }, [searchTerm, groupedBookings]);

  const handleRowClick = async (contact) => {
    try {
      const response = await fetch(
        `https://msfunpark.com/funpark/api/customer/getCustomer?contact=${contact}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json"
          },
        }
      );

      const data = await response.json();
      toast.success(`Fetched details for contact: ${contact}`);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };

  const navigation = useNavigate();

  return (
    <BookingContainer>
       <IconButton
            edge="start"
            color="inherit"
            onClick={()=>navigation(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
      <Title>Booking Management</Title>
      <p>Slot ID: {slotId}</p>

      <FilterSection>
        <div>
          <SearchInput
            type="text"
            placeholder="Search by contact or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <span style={{ color: '#666', marginRight: '0.5rem' }}>Total Customers:</span>
          <span style={{ fontWeight: 'bold', color: '#4e54c8' }}>{filteredGroupedBookings.length}</span>
          <span style={{ color: '#666', margin: '0 0.5rem' }}>|</span>
          <span style={{ color: '#666', marginRight: '0.5rem' }}>Total Seats:</span>
          <span style={{ fontWeight: 'bold', color: '#4e54c8' }}>
            {filteredGroupedBookings.reduce((sum, booking) => sum + booking.seatCount, 0)}
          </span>
        </div>
      </FilterSection>

      {filteredGroupedBookings.length > 0 ? (
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Package</TableHeaderCell>
              <TableHeaderCell>Seats Booked</TableHeaderCell>
              <TableHeaderCell>Seat Numbers</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {filteredGroupedBookings.map((booking) => (
              <TableRow
                key={booking.customer.contact}
                onClick={() => handleRowClick(booking.customer.contact)}
              >
                <TableCell style={{ fontWeight: '500', color: '#333' }}>
                  {booking.customer.username}
                </TableCell>
                <TableCell>{booking.customer.contact}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: '500' }}>{booking.packages[0].packageName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>₹{booking.packages[0].packagePrice}</div>
                </TableCell>
                <TableCell>{booking.seatCount}</TableCell>
                <TableCell>
                  {booking.seats.join(', ')}
                </TableCell>
                <TableCell>
                  <StatusBadge>BOOKED</StatusBadge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={(e) => handlePrintClick(booking, e)}
                    sx={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      minWidth: '100px'
                    }}
                  >
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3V7" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 3V7" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 11H21" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 style={{ margin: '1rem 0 0.5rem', color: '#444' }}>No bookings found</h3>
          <p style={{ margin: 0, color: '#888' }}>Try adjusting your search or filter</p>
        </EmptyState>
      )}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxWidth: '5.2cm',
            maxHeight: 'none', // Changed from '13.7cm' to allow dynamic height
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: 'white',
          color: 'primary.main',
          p: '8px',
          textAlign: 'center',
          fontWeight: "600",
          mb: "7%"
        }}>
          <Typography variant="subtitle2" fontWeight="bold">
            FUNPARK TICKET
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          p: 0,
          height: 'auto', // Changed from fixed height to auto
          overflow: 'visible'
        }}>
          {selectedBooking && (
            <Box
              id="receipt-to-print"
              sx={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: '9px',
                width: '5cm',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                p: '5px'
              }}
            >
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: '2px' }}>
                <Typography variant="caption" color="#000" fontWeight={"600"}>
                  {formatDate(selectedBooking.packages[0]?.slot?.slotDate)} | {formatTime(selectedBooking.packages[0]?.slot?.slotStart)}
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
                  {extractTeamNames(selectedBooking.packages[0]?.slot?.slotName).team1}
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  VS
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {extractTeamNames(selectedBooking.packages[0]?.slot?.slotName).team2}
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
                  <strong>Name:</strong> {selectedBooking.customer?.username || 'N/A'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: '2px' }}>
                  <strong>Phone:</strong> +91 {selectedBooking.customer?.contact || 'N/A'}
                </Typography>
              </Box>

              {/* Ticket Details */}
              <Box sx={{ mb: '4px' }}>
                <Typography variant="caption" fontWeight="bold" sx={{ mb: '2px' }}>
                  TICKET DETAILS:
                </Typography>
                <Box sx={{ mb: '4px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">
                      {selectedBooking.packages[0]?.packageName} ({selectedBooking.seatCount})
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      ₹{(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2px',
                    mt: '2px',
                    maxHeight: 'none', // Removed height restriction
                    overflow: 'visible'
                  }}>
                    {selectedBooking.seats?.map((seat, index) => (
                      <Box key={index} sx={{
                        bgcolor: '#f0f0f0',
                        p: '0 4px',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: "600"
                      }}>
                        {seat}
                      </Box>
                    ))}
                  </Box>
                </Box>
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
                  <Typography variant="caption">₹{(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '2px' }}>
                  <Typography variant="caption">Total Amount:</Typography>
                  <Typography variant="caption" fontWeight="bold">
                    ₹{(selectedBooking.packages[0]?.packagePrice * selectedBooking.seatCount).toLocaleString('en-IN')}
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
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: "8px",
            justifyContent: "center",
            borderTop: "1px solid #eee",
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            onClick={() => setOpenPrintDialog(false)}
            size="small"
            sx={{
              fontSize: "10px",
              minWidth: "70px",
              p: "4px 8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrintReceipt}
            variant="contained"
            size="small"
            startIcon={<PrintIcon sx={{ fontSize: "14px" }} />}
            disabled={isPrinting}
            sx={{
              fontSize: "10px",
              minWidth: "80px",
              p: "4px 8px",
            }}
          >
            {isPrinting ? "Printing..." : "Print"}
          </Button>
        </DialogActions>
      </Dialog>
    </BookingContainer>
  );
}

export default GetBookings;