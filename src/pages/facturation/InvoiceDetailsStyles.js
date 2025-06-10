import styled from 'styled-components';

// Style aligné sur le PDF : fonds très clair, coins arrondis, ombres douces, titres marqués, sections espacées
export const InvoiceContainer = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.04);
  color: #222;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #388e3c;
`;

export const CompanyDetails = styled.div`
  width: 60%;
  border-right: 1px solid #e0e0e0;
  padding-right: 10px;

  img {
    height: 60px;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 1.6rem;
    margin: 0 0 5px 0;
    font-weight: bold;
    color: #2c3e50;
  }

  p {
    margin: 0;
    color: #222;
    font-size: 1rem;
  }
`;

export const InvoiceDetailsSection = styled.div`
  width: 40%;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  h3 {
    font-size: 1.2rem;
    margin: 0 0 10px 0;
    color: #388e3c;
    font-weight: bold;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: #222;
    font-size: 1rem;
  }
`;

export const BillingSection = styled.div`
  margin-bottom: 18px;
  margin-top: 0;
  padding: 0;
`;

export const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

// TABLEAU PRINCIPAL (services)
export const TableContainer = styled.div`
  overflow-x: auto;
  margin: 10px 0 20px 0;

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.04);

    th, td {
      padding: 8px;
      border: 1px solid #e0e0e0;
      font-size: 0.95rem;
      text-align: center;
    }

    th {
      background-color: #388e3c;
      color: #fff;
      font-weight: bold;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      font-size: 1rem;
    }

    tr:nth-child(even) td {
      background-color: #f9f9f9;
    }
    tr:nth-child(odd) td {
      background-color: #fff;
    }
  }
`;

// TABLEAU DYNAMIQUE EN BAS (style identique au PDF)
export const DynamicTableContainer = styled.div`
  overflow-x: auto;
  margin: 20px 0 0 0;

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.04);

    th, td {
      padding: 8px;
      border: 1px solid #e0e0e0;
      font-size: 0.95rem;
      text-align: center;
    }

    th {
      background-color: #388e3c;
      color: #fff;
      font-weight: bold;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      font-size: 1rem;
    }

    tr:nth-child(even) td {
      background-color: #f9f9f9;
    }
    tr:nth-child(odd) td {
      background-color: #fff;
    }
  }
`;

export const TotalsSection = styled.div`
  text-align: right;
  margin-top: 10px;
  margin-bottom: 20px;

  p {
    margin: 2px 0;
    font-size: 1rem;
    color: #222;
  }

  p.total {
    font-weight: bold;
    font-size: 1.1rem;
    color: #388e3c;
  }
`;

export const PaymentInfoSection = styled.div`
  margin-top: 20px;

  p {
    margin: 0;
    color: #666;
    font-size: 1rem;
  }
`;

export const NotesSection = styled.div`
  margin-top: 10px;

  p {
    margin: 0;
    color: #666;
    font-size: 1rem;
  }
`;

export const Footer = styled.div`
  margin-top: 40px;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  padding-top: 5px;
  line-height: 1.2;
`;
