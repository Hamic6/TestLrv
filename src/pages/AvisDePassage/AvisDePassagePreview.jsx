import React from "react";
import { Paper, Typography, Divider, Stack, Chip } from "@mui/material";

const AvisDePassagePreview = ({ avis }) => {
  if (!avis) return null;
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Avis de Passage n° {avis.avisInfo?.number}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Client : {avis.billTo?.company}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Date : {avis.avisInfo?.date}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Services :
      </Typography>
      <Stack direction="column" spacing={0.5}>
        {avis.services?.map((service, idx) => (
          <Chip
            key={idx}
            label={service.libelle}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 220, fontSize: 13, height: 28 }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default AvisDePassagePreview;