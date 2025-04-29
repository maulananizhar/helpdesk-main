import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { SidebarContext } from "../../context/SidebarContext"; // Impor SidebarContext
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
}));

// Widget ringkasan statistik
const SummaryWidget = ({ users }) => {
  const totalUsers = users.length;
  const roleCounts = {};
  users.forEach((user) => {
    const role = user.role || "Unknown";
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  return (
    <Paper sx={{ padding: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Summary Statistik User
      </Typography>
      <Typography variant="subtitle1">Total User: {totalUsers}</Typography>
      {Object.entries(roleCounts).map(([role, count]) => (
        <Typography key={role} variant="subtitle2">
          {role}: {count}
        </Typography>
      ))}
    </Paper>
  );
};

const UserLists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { getUsersData, users, deleteUser } = useContext(AdminContext);
  // Dapatkan nilai isSidebarOpen dari SidebarContext
  const { isSidebarOpen } = useContext(SidebarContext);

  useEffect(() => {
    getUsersData();
  }, [getUsersData]);

  const filteredUsers = users.filter(
    (user) =>
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Terapkan margin kiri dinamis berdasarkan kondisi sidebar
    <StyledContainer
      maxWidth="lg"
      sx={{
        ml: isSidebarOpen ? "-70px" : "-170px", // Sesuaikan nilai ini dengan lebar sidebar Anda
        transition: "margin-left 0.3s ease",
      }}
    >
      <Grid container spacing={2}>
        {/* Kolom kiri: Daftar user */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 3, marginBottom: 3 }}>
            <HeaderBox>
              <Typography variant="h4" component="h1">
                Daftar User
              </Typography>
              <NavLink to="/regist-user" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary">
                  Tambah User
                </Button>
              </NavLink>
            </HeaderBox>
            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cari berdasarkan Nama atau Email..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Button variant="outlined" color="primary" onClick={getUsersData}>
                  Refresh Data
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            {/* Ganti properti Table menjadi width: "100%" agar tabel mengisi container */}
            <Table sx={{ width: "100%" }}>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <StyledTableCell>No</StyledTableCell>
                  <StyledTableCell>Nama</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Aksi</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{user.nama}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <NavLink
                          to={`/edit-user/${user.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Button variant="contained" color="warning" sx={{ mr: 1 }}>
                            Edit
                          </Button>
                        </NavLink>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => deleteUser(user.id)}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Kolom kanan: Widget ringkasan statistik */}
        <Grid item xs={12} md={4}>
          <SummaryWidget users={users} />
        </Grid>
      </Grid>
    </StyledContainer>
  );
};

export default UserLists;
