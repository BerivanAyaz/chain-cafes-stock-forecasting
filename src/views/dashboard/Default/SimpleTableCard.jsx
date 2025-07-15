import { useState, useMemo } from 'react'; // useMemo'yu import ediyoruz
import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete'; // Autocomplete bileşenini import ediyoruz

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| ADVANCED FILTER TABLE CARD ||============================== //

export default function SimpleTableCard({ isLoading, title, data }) {
  // Sütun başlıklarını alıyoruz
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  // Filtre durumunu yönetmek için state. Örn: { "SütunAdı": ["seçilenDeğer1", "seçilenDeğer2"] }
  const [filters, setFilters] = useState({});

  // Her sütun için benzersiz değerleri hesapla ve memoize et (performans için)
  const columnOptions = useMemo(() => {
    if (!data || data.length === 0) return {};
    const options = {};
    headers.forEach((header) => {
      // Set kullanarak o sütundaki tüm benzersiz değerleri al
      const uniqueValues = [...new Set(data.map((item) => String(item[header])))];
      options[header] = uniqueValues;
    });
    return options;
  }, [data, headers]);

  // Autocomplete'den gelen yeni filtre değerlerini state'e işleyen fonksiyon
  const handleFilterChange = (newValue, header) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [header]: newValue // newValue bir dizi olacak (örn: ["Ankara", "İstanbul"])
    }));
  };

  // Seçilen filtrelere göre veriyi süzen mantık
  const filteredData = data.filter((row) => {
    return headers.every((header) => {
      const selectedValues = filters[header];
      // Eğer o sütun için bir filtre seçilmemişse veya seçilenler listesi boşsa, bu satırı geç
      if (!selectedValues || selectedValues.length === 0) {
        return true;
      }
      // Satırdaki değer, seçilen değerler listesinde var mı diye kontrol et
      return selectedValues.includes(String(row[header]));
    });
  });

  return (
    <MainCard title={title}>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}> {/* Yüksekliği biraz artırdım */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader sx={{ minWidth: 650 }} aria-label="advanced filter table">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header} sx={{ top: 0 }}>
                    {/* Autocomplete bileşeni */}
                    <Autocomplete
                      multiple // Çoklu seçime izin ver
                      disableCloseOnSelect // Seçim yapınca menünün kapanmasını engelle
                      size="small"
                      options={columnOptions[header] || []} // O sütuna ait benzersiz değerler
                      value={filters[header] || []} // Seçili olan değerler
                      onChange={(event, newValue) => handleFilterChange(newValue, header)}
                      // Input alanının nasıl görüneceğini belirle
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label={header} // Başlığı label olarak kullan
                          placeholder="Değer ara veya seç..."
                        />
                      )}
                      sx={{ minWidth: 180 }} // Genişliğin çok daralmasını engelle
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, rowIndex) => (
                <TableRow hover key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {headers.map((header) => (
                    <TableCell key={header}>
                      {row[header]}
                    </TableCell>
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