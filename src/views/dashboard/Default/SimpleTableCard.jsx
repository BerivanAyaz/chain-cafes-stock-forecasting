import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box'; // Box'ı import ediyoruz
import CircularProgress from '@mui/material/CircularProgress'; // Spinner'ı import ediyoruz
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// project imports
import MainCard from 'ui-component/cards/MainCard';
// Skeleton'a artık ihtiyacımız yok, ama isterseniz kalabilir.

// ==============================|| SIMPLE TABLE CARD ||============================== //

export default function SimpleTableCard({ isLoading, title, data }) {
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    // Ana kart artık yükleme durumuna bağlı değil, her zaman render ediliyor.
    <MainCard title={title}>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        {/* Yükleme mantığını tablo konteynerinin içine taşıyoruz. */}
        {isLoading ? (
          // Yükleniyorsa: Spinner'ı ortalamak için bir Box içinde göster.
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          // Yükleme bittiyse: Tabloyu göster.
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {headers.map((header) => (
                    <TableCell key={header}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </MainCard>
  );
}

SimpleTableCard.propTypes = {
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  data: PropTypes.array
};