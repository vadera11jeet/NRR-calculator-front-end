import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  FormControl,
  Container,
} from "@mui/material";
import TEAMS, { BATTING, BOWLING, TEAM_BY_ID } from "./utils/constant";
import { useState } from "react";
import axiosInstance from "./utils/axiosConfig";
import { NRR_CALCULATION_END_POINT } from "./utils/apiConfig";
import ResultModal from "./components/Modal";

const NRRForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      team: "",
      oppositionTeam: "",
      overs: 20,
      desiredPosition: 1,
      tossResult: BATTING,
      runsScored: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");

  const selectedTeam = watch("team");
  const tossResult = watch("tossResult");

  const onSubmit = async (data) => {
    const requestBody = {
      teamId: data.team,
      oppositionTeamId: data.oppositionTeam,
      numberOfOvers: data.overs,
      desiredPosition: data.desiredPosition,
      isBattedFirst: data.tossResult === BATTING,
    };

    if (data.tossResult === BATTING) {
      requestBody.totalScoredRuns = data.runsScored;
    } else {
      requestBody.targetRuns = data.runsScored;
    }
    try {
      setIsLoading(true);

      let response = await axiosInstance.post(
        NRR_CALCULATION_END_POINT,
        requestBody
      );

      if (data.tossResult === BATTING && response.data?.data) {
        setResult(
          `${TEAM_BY_ID[data.team]} scores ${data.runsScored} runs in ${
            data.overs
          } overs, ${TEAM_BY_ID[data.team]} needs to restrict ${
            TEAM_BY_ID[data.oppositionTeam]
          } ${
            response.data?.data?.lowerBound?.lowerBound
              ? ` between ${
                  response.data?.data?.lowerBound?.lowerBound ?? ""
                } to ${response.data?.data?.upperBound?.upperBound ?? ""}`
              : `${response.data?.data?.upperBound?.upperBound}`
          } runs in  ${data.overs} overs\n Revised NRR of ${
            TEAM_BY_ID[data.team]
          } will be ${
            response.data?.data?.lowerBound?.lNrr
              ? `between  ${response.data?.data?.upperBound?.uNrr ?? ""} to ${
                  response.data?.data?.lowerBound?.lNrr
                }`
              : `${response.data?.data?.upperBound?.uNrr}`
          }`
        );
      } else if (data.tossResult === BOWLING && response.data?.data) {
        setResult(
          `${TEAM_BY_ID[data.team]} needs to chase ${data.runsScored} runs ${
            response.data?.data?.upperBound?.upperBound
              ? `between ${response.data?.data?.upperBound?.upperBound} and ${response.data?.data?.lowerBound?.lowerBound}`
              : `in ${response.data?.data?.lowerBound?.lowerBound}`
          }\n Revised NRR of ${TEAM_BY_ID[data.team]} will be ${
            response.data?.data?.upperBound?.uNrr
              ? `between ${response.data?.data?.lowerBound?.lNrr} to ${response.data?.data?.upperBound?.uNrr}`
              : `${response.data?.data?.lowerBound?.lNrr}`
          } `
        );
      } else {
        setResult(response.data?.message);
      }
      setOpen(true);
    } catch (err) {
      console.log(err);
    } finally {
      reset();
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ width: "100vw" }}>
        <Container
          maxWidth="sm"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
          }}
        >
          <Card sx={{ mt: 1, mb: 1 }}>
            <CardContent>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ mb: 4, textAlign: "center" }}
              >
                Margin Calculator Based On NRR
              </Typography>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="team"
                  control={control}
                  rules={{ required: "Please select your team" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.team}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        label="Your Team"
                        select
                        disabled={isLoading}
                        error={!!errors.team}
                        helperText={errors.team?.message}
                      >
                        <MenuItem value="">Select your team</MenuItem>
                        {TEAMS.map((team) => (
                          <MenuItem key={team.id} value={team.id}>
                            {team.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  )}
                />

                <Controller
                  name="oppositionTeam"
                  control={control}
                  rules={{
                    required: "Please select opposition team",
                    validate: (value) =>
                      value !== selectedTeam ||
                      "Opposition team must be different from your team",
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.oppositionTeam}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        label="Opposition Team"
                        disabled={isLoading}
                        select
                        error={!!errors.oppositionTeam}
                        helperText={errors.oppositionTeam?.message}
                      >
                        <MenuItem value="">Select opposition team</MenuItem>
                        {TEAMS.map((team) => (
                          <MenuItem key={team.id} value={team.id}>
                            {team.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                  )}
                />
                <Controller
                  name="overs"
                  control={control}
                  rules={{
                    required: "Number of overs is required",
                    min: { value: 1, message: "Minimum 1 over required" },
                    max: { value: 50, message: "Maximum 50 overs allowed" },
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.overs}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        type="number"
                        disabled={isLoading}
                        label="Number of Overs"
                        error={!!errors.overs}
                        helperText={errors.overs?.message}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  name="desiredPosition"
                  control={control}
                  rules={{
                    required: "Desired position is required",
                    min: { value: 1, message: "Position must be at least 1" },
                    max: {
                      value: TEAMS.length,
                      message: `Maximum position is ${TEAMS.length}`,
                    },
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.desiredPosition}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        disabled={isLoading}
                        type="number"
                        label="Desired Position"
                        error={!!errors.desiredPosition}
                        helperText={errors.desiredPosition?.message}
                      />
                    </FormControl>
                  )}
                />

                <Controller
                  name="tossResult"
                  control={control}
                  rules={{ required: "Please select toss result" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.tossResult}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        label="Toss Result"
                        select
                        disabled={isLoading}
                        error={!!errors.tossResult}
                        helperText={errors.tossResult?.message}
                      >
                        <MenuItem value={BATTING}>Batting First</MenuItem>
                        <MenuItem value={BOWLING}>Bowling First</MenuItem>
                      </TextField>
                    </FormControl>
                  )}
                />

                <Controller
                  name="runsScored"
                  control={control}
                  rules={{
                    required: "Runs is required",
                    min: { value: 0, message: "Runs cannot be negative" },
                  }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.runsScored}
                      sx={{ marginBottom: 1, marginTop: 1 }}
                    >
                      <TextField
                        {...field}
                        disabled={isLoading}
                        type="number"
                        label={
                          tossResult === "batting"
                            ? "Runs Scored"
                            : "Runs to Chase"
                        }
                        error={!!errors.runsScored}
                        helperText={errors.runsScored?.message}
                      />
                    </FormControl>
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 2 }}
                >
                  Calculate
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <ResultModal open={open} setOpen={setOpen} result={result} />
    </>
  );
};

export default NRRForm;
