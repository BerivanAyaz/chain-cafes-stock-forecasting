import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import SimpleTableCard from './SimpleTableCard';
import { gridSpacing } from 'store/constant';

// Basit bir CSV metnini JSON objesine dönüştüren yardımcı fonksiyon
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
  return rows;
};

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Google Sheets'ten CSV linklerinizi buraya yapıştırın
        const TRAIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVidyTj9xAQ6YtQTeRnH2eFyjZkdabXDTdXvteA1_LaLDrP2rHGOWMQ11xSRbDltFMyMVhuYChcyTl/pub?gid=0&single=true&output=csv';
        const FORECAST_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVidyTj9xAQ6YtQTeRnH2eFyjZkdabXDTdXvteA1_LaLDrP2rHGOWMQ11xSRbDltFMyMVhuYChcyTl/pub?gid=169020155&single=true&output=csv';

        // Her iki veriyi aynı anda çekiyoruz
        const [trainResponse, forecastResponse] = await Promise.all([
          fetch(TRAIN_DATA_URL),
          fetch(FORECAST_DATA_URL)
        ]);

        const trainText = await trainResponse.text();
        const forecastText = await forecastResponse.text();

        // Çekilen verileri JSON formatına çeviriyoruz
        setTrainData(parseCSV(trainText));
        setForecastData(parseCSV(forecastText));

      } catch (error) {
        console.error("Veri çekilirken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <Grid container spacing={gridSpacing}> 
      {/* İlk Tablo: Forecast verisini gönderiyoruz */}
      <Grid item size={{ xs: 12 }}>
        <SimpleTableCard isLoading={isLoading} title="Forecast Data" data={forecastData} />
      </Grid>
         {/* İkinci Tablo: Train verisini gönderiyoruz */}
       <Grid item size={{ xs: 12 }}>
        <SimpleTableCard isLoading={isLoading} title="Train Data" data={trainData} />
      </Grid>
    </Grid>
  );
}