import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Grid, Button, Box } from '@mui/material';
import { styled } from '@mui/system';

// Full page background dengan gradient
const FullPageBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(to right, #2563eb, #d97706)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

// StyledPaper untuk konten formulir (dikurangi lebar dan padding-nya)
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2), // dikurangi dari 4
  backgroundColor: '#fafafa',
  maxWidth: '600px',         // dikurangi dari 800px
  width: '100%',
}));

const FormInformationPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data formulir dari endpoint backend
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`http://localhost:3500/admin/form/${id}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data formulir');
        }
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  if (loading) {
    return (
      <FullPageBackground>
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      </FullPageBackground>
    );
  }

  if (!formData) {
    return (
      <FullPageBackground>
        <Typography variant="h6" align="center">
          Data formulir tidak ditemukan.
        </Typography>
      </FullPageBackground>
    );
  }

  // Format tanggal proses dan selesai jika tersedia
  const prosesDate = formData.proses_at ? new Date(formData.proses_at).toLocaleString() : '-';
  const selesaiDate = formData.selesai_at ? new Date(formData.selesai_at).toLocaleString() : '-';

  return (
    <FullPageBackground>
      <Container maxWidth="sm">
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom>
            Informasi Formulir
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Nama:</strong> {formData.nama || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Email:</strong> {formData.email || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Unit:</strong> {formData.unit || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Ticket:</strong> {formData.ticket || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Layanan:</strong> {formData.layanan || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Jenis Layanan:</strong> {formData.jenis_layanan || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Sub Jenis Layanan:</strong> {formData.subjenis_layanan || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Status:</strong> {formData.status || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Tindak Lanjut:</strong> {formData.tindak_lanjut || 'Belum ada'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Eskalasi:</strong> {formData.eskalasi ? 'Ya' : 'Tidak'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>PIC:</strong> {formData.pic_nama || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Tanggal Proses:</strong> {prosesDate}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Tanggal Selesai:</strong> {selesaiDate}
              </Typography>
            </Grid>
          </Grid>
          <Button 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '16px' }}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </StyledPaper>
      </Container>
    </FullPageBackground>
  );
};

export default FormInformationPage;
