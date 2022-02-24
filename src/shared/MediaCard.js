import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import LoadingButton from '@mui/lab/LoadingButton';

import Typography from "@mui/material/Typography";

export default function MediaCard({
  title,
  image,
  details,
  action,
  actionText,
  loading,
}) {
  return (
    <Card sx={{ minWidth: 345 }}>
      <CardMedia
        component="img"
        height="140"
        image={image}
        alt="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {details}
        </Typography>
      </CardContent>
      {action && (
        <CardActions>
          <LoadingButton onClick={action} loading={loading} variant="contained">
            {actionText}
          </LoadingButton>
        </CardActions>
      )}
    </Card>
  );
}
