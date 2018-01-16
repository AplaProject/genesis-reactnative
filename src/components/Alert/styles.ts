import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  dialog: {
    margin: 20
  },
  dialogTitle: {
    color: '#000'
  },
  dialogContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between'
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  dialogButtonStyle: {
    flex: 0,
    marginVertical: 0,
    padding: 0,
    paddingTop: 10,
    minWidth: 100
  },
  dialogCancelButtonStyle: {
    marginHorizontal: 10,
    backgroundColor: '#f05050'
  },
  dialogConfirmButtonStyle: {
    marginHorizontal: 10
  },
});

export default styles;
