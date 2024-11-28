import { StyleSheet } from '@react-pdf/renderer';

const commonStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyDetails: {
    flex: 1,
    paddingRight: 20,
  },
  invoiceDetailsSection: {
    flex: 1,
    paddingLeft: 20,
    textAlign: 'right',
  },
  billingSection: {
    marginBottom: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    backgroundColor: '#f3f3f3',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableCellHeader: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  totalsSection: {
    marginTop: 20,
    textAlign: 'right',
  },
  paymentInfoSection: {
    marginTop: 20,
    textAlign: 'left',
  },
  notesSection: {
    marginTop: 20,
    textAlign: 'left',
  },
  footer: {
    marginTop: 20,
    textAlign: 'left',
    fontSize: 10,
    color: 'grey',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
});

export default commonStyles;
