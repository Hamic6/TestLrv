import styled from 'styled-components';

export const InvoiceContainer = styled.div`
  background-color: #f9f9f9;
  padding: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

export const CompanyDetails = styled.div`
  text-align: left;

  img {
    height: 60px;
    margin-bottom: 10px;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

export const InvoiceDetailsSection = styled.div`
  text-align: right;

  h3 {
    font-size: 2rem;
    margin: 0 0 10px;
    color: #3a3a3a;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

export const BillingSection = styled.div`
  margin: 20px 0;

  h4 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #3a3a3a;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;

    th, td {
      padding: 12px;
      border: 1px solid #ddd;
    }

    th {
      background-color: #f0f0f0;
      color: #333;
    }

    td {
      background-color: #fff;
    }
  }
`;



export const TotalsSection = styled.div`
  text-align: right;
  margin-top: 20px;

  p {
    margin: 5px 0;
    font-size: 1rem;
  }

  p.total {
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

export const PaymentInfoSection = styled.div`
  margin-top: 20px;

  p {
    margin: 0;
    color: #666;
  }
`;

export const NotesSection = styled.div`
  margin-top: 10px;

  p {
    margin: 0;
    color: #666;
  }
`;
