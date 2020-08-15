import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Icon,
  InputLabel,
  Select,
  TextField,
  Theme,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import DateFnsUtils from '@date-io/date-fns'; // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
import MaterialUtils from '@date-io/moment';
import { isMobile } from 'react-device-detect';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DatePicker, MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import { Amenity, Question, UserManager } from 'condo-brain';
import './styles/application.scss';
import './styles/parking.scss';

export default function Resevation(): JSX.Element {
  const [selectedStartDate, handleStartDateChange] = useState<Date | null>(new Date());
  const [selectedEndDate, handleEndDateChange] = useState<Date | null>(new Date());
  const [amenity, setAmenity] = useState<string | unknown>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [thanks, setThanks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | unknown>(null);

  const userManager = new UserManager();

  const reserve = (e: React.FormEvent): void => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('reservation[resource_id]', String(amenity));
    formData.append('reservation[start_time]', String(selectedStartDate));
    formData.append('reservation[end_time]', String(selectedEndDate));
    formData.append('answers[]', JSON.stringify(answers));
    userManager.createReservation(formData)
      .then((response) => {
        if (response.success === true) {
          setThanks(true);
        } else if (response.error === 'Unprocessable Entity') {
          const err = 'Please make sure you have filled out the form correctly. '
            + 'If you could not check every box, then you cannot use this amenity.';
          setErrorMessage(err);
        } else {
          setErrorMessage(response.error);
        }
      });
  };

  const fetchAmenities = async (): Promise<void> => (
    userManager.getAmenities().then((result) => (setAmenities(result)))
  );

  const fetchQuestions = async (): Promise<void> => (
    userManager.getQuestions().then((result) => (setQuestions(result)))
  );

  useEffect(() => {
    fetchAmenities();
    fetchQuestions();
  }, [amenities.length]);

  const handleAmenityChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const reserveAmenity = event.target.value;
    setAmenity(reserveAmenity);
  };

  const handleAnswerChange = (event: React.ChangeEvent<{ name?: string; checked: unknown }>): void => {
    if (event.target.checked) {
      const currentAnswers = answers;
      currentAnswers[Number(event.target.name)] = true;
      setAnswers(currentAnswers);
    } else {
      const currentAnswers = answers;
      currentAnswers[Number(event.target.name)] = false;
      setAnswers(currentAnswers);
    }
  };

  const handleNativeDateChange = (date: string): void => {
    const changedDate = new Date(date);
    const startDate = new Date(
      changedDate.getFullYear(),
      changedDate.getMonth(),
      changedDate.getDate(),
      selectedStartDate?.getHours(),
      selectedStartDate?.getMinutes(),
    );
    handleStartDateChange(startDate);

    const endDate = new Date(
      changedDate.getFullYear(),
      changedDate.getMonth(),
      changedDate.getDate(),
      selectedEndDate?.getHours(),
      selectedEndDate?.getMinutes(),
    );
    handleEndDateChange(endDate);
  };

  const handleNativeStartTimeChange = (date: string): void => {
    const [hour, minute] = date.split(':');

    const startDate = new Date(
      selectedStartDate?.getFullYear() || new Date().getFullYear(),
      selectedStartDate?.getMonth() || new Date().getMonth(),
      selectedStartDate?.getDate() || new Date().getDate(),
      Number(hour),
      Number(minute),
    );

    handleStartDateChange(startDate);
  };

  const handleNativeEndTimeChange = (date: string): void => {
    const [hour, minute] = date.split(':');

    const endDate = new Date(
      selectedEndDate?.getFullYear() || new Date().getFullYear(),
      selectedEndDate?.getMonth() || new Date().getMonth(),
      selectedEndDate?.getDate() || new Date().getDate(),
      Number(hour),
      Number(minute),
    );

    handleEndDateChange(endDate);
  };

  const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '100%',
      },
    },
    registerButton: {
      backgroundColor: '#f37f30',
      color: 'white',
      marginBottom: '20px',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));

  const classes = useStyles();

  return (
    <div>
      { thanks && (
        <div className="section flex-grow">
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <h4 className="center">Amenity reserved</h4>
              <p className="center">
                Thank you!
                {'  '}
                <span role="img" aria-label="">🤟</span>
                Your reservation has been confirmed!
                {'  '}
              </p>
            </Grid>
          </Grid>
        </div>
      )}
      { !thanks && (
        <form className={classes.root} noValidate autoComplete="off" onSubmit={reserve}>
          <div className="section flex-grow">
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <h4 className="center">Reserve an Amenity</h4>
                { errorMessage && (
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                  </Alert>
                )}
              </Grid>
              <MuiPickersUtilsProvider utils={MaterialUtils}>
                <Grid item xs={6}>
                  <InputLabel htmlFor="age-native-simple">Amenity</InputLabel>
                  <Select
                    native
                    value={amenity}
                    onChange={handleAmenityChange}
                    inputProps={{
                      name: 'amenity',
                      id: 'amenity',
                    }}
                    style={{ width: '100%' }}
                  >
                    <option aria-label="None" value="" />
                    {amenities.map(
                      (amenityOption: Amenity) => (
                        <option key={amenityOption.id} value={String(amenityOption.id)}>{amenityOption.name}</option>
                      ),
                    )}
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="start"
                      label="Date"
                      type="date"
                      defaultValue={selectedStartDate}
                      onChange={(e): void => handleNativeDateChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <DatePicker
                      id="start"
                      value={selectedStartDate}
                      label="Date"
                      onChange={handleStartDateChange}
                      style={{ width: '100%' }}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="startTime"
                      label="Start Time"
                      type="time"
                      defaultValue={selectedStartDate}
                      onChange={(e): void => handleNativeStartTimeChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <TimePicker
                      id="startTime"
                      value={selectedStartDate}
                      label="Start Time"
                      onChange={handleStartDateChange}
                      style={{ width: '100%' }}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  { isMobile && (
                    <TextField
                      id="endTime"
                      label="End Time"
                      type="time"
                      defaultValue={selectedEndDate}
                      onChange={(e): void => handleNativeEndTimeChange(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                  { !isMobile && (
                    <TimePicker
                      id="endTime"
                      value={selectedEndDate}
                      label="End Time"
                      onChange={handleEndDateChange}
                      style={{ width: '100%' }}
                    />
                  )}
                </Grid>
                {questions.map(
                  (questionOption) => (
                    <Grid item xs={12} key={questionOption.id}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={answers[questionOption.id]}
                            onChange={handleAnswerChange}
                            name={String(questionOption.id)}
                            color="primary"
                          />
                        )}
                        label={questionOption.question}
                      />
                    </Grid>
                  ),
                )}
                <Grid item xs={12} className="center">
                  <Button
                    variant="contained"
                    type="submit"
                    className={classes.registerButton}
                    endIcon={<Icon>add</Icon>}
                  >
                    Reserve
                  </Button>
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
          </div>
        </form>
      )}
    </div>
  );
}
