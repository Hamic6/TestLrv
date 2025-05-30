import React from "react";
import styled from "@emotion/styled";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  Breadcrumbs as MuiBreadcrumbs,
  Card as MuiCard,
  CardContent,
  Divider as MuiDivider,
  Grid as Grid,
  Link,
  Typography,
} from "@mui/material";
import { Pagination as MuiPagination } from "@mui/material";
import { spacing } from "@mui/system";

const Card = styled(MuiCard)(spacing);

const Spacer = styled.div(spacing);

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Pagination = styled(MuiPagination)(spacing);

function BasicPagination() {
  return (
    <Card mb={6}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Basic pagination
        </Typography>
        <Typography variant="body2" gutterBottom>
          The Pagination component enables the user to select a specific page
          from a range of pages.
        </Typography>

        <Spacer mb={6} />

        <Pagination mb={2} count={10} />
        <Pagination mb={2} count={10} color="primary" />
        <Pagination mb={2} count={10} color="secondary" />
        <Pagination mb={2} count={10} disabled />
      </CardContent>
    </Card>
  );
}

function OutlinedPagination() {
  return (
    <Card mb={6}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Outlined pagination
        </Typography>
        <Typography variant="body2" gutterBottom>
          The Pagination component enables the user to select a specific page
          from a range of pages.
        </Typography>

        <Spacer mb={6} />

        <Pagination mb={2} count={10} variant="outlined" />
        <Pagination mb={2} count={10} variant="outlined" color="primary" />
        <Pagination mb={2} count={10} variant="outlined" color="secondary" />
        <Pagination mb={2} count={10} variant="outlined" disabled />
      </CardContent>
    </Card>
  );
}

function RoundedPagination() {
  return (
    <Card mb={6}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rounded pagination
        </Typography>
        <Typography variant="body2" gutterBottom>
          The Pagination component enables the user to select a specific page
          from a range of pages.
        </Typography>

        <Spacer mb={6} />

        <Pagination mb={2} count={10} variant="outlined" shape="rounded" />
        <Pagination
          mb={2}
          count={10}
          variant="outlined"
          shape="rounded"
          color="primary"
        />
        <Pagination
          mb={2}
          count={10}
          variant="outlined"
          shape="rounded"
          color="secondary"
        />
        <Pagination
          mb={2}
          count={10}
          variant="outlined"
          shape="rounded"
          disabled
        />
      </CardContent>
    </Card>
  );
}

function PaginationSizes() {
  return (
    <Card mb={6}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pagination sizes
        </Typography>
        <Typography variant="body2" gutterBottom>
          The Pagination component enables the user to select a specific page
          from a range of pages.
        </Typography>

        <Spacer mb={6} />

        <Pagination mb={2} count={10} size="small" />
        <Pagination mb={2} count={10} />
        <Pagination mb={2} count={10} size="large" />
      </CardContent>
    </Card>
  );
}

function PaginationRanges() {
  return (
    <Card mb={6}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pagination ranges
        </Typography>
        <Typography variant="body2" gutterBottom>
          The Pagination component enables the user to select a specific page
          from a range of pages.
        </Typography>
        <Spacer mb={6} />
        <Pagination mb={2} count={11} defaultPage={6} siblingCount={0} />
        <Pagination mb={2} count={11} defaultPage={6} /> {/* Default ranges */}
        <Pagination
          mb={2}
          count={11}
          defaultPage={6}
          siblingCount={0}
          boundaryCount={2}
        />
        <Pagination mb={2} count={11} defaultPage={6} boundaryCount={2} />
      </CardContent>
    </Card>
  );
}

function PaginationComponents() {
  return (
    <React.Fragment>
      <Helmet title="Pagination" />
      <Typography variant="h3" gutterBottom display="inline">
        Pagination
      </Typography>
      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} to="/">
          Dashboard
        </Link>
        <Link component={NavLink} to="/">
          Components
        </Link>
        <Typography>Pagination</Typography>
      </Breadcrumbs>
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <BasicPagination />
          <OutlinedPagination />
          <RoundedPagination />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <PaginationSizes />
          <PaginationRanges />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default PaginationComponents;
