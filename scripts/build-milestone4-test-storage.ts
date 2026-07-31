import { basicBeginnerProgram } from "../src/programs/basicBeginnerProgram";
import { Storage_get, Storage_getDefault } from "../src/models/storage";
import { DateUtils_formatYYYYMMDD } from "../src/utils/date";
import { IHistoryRecord } from "../src/types";

const storage = Storage_getDefault();
const now = Date.now();
const history: IHistoryRecord = {
  vtype: "history_record",
  date: DateUtils_formatYYYYMMDD(now, "-"),
  programId: basicBeginnerProgram.id,
  programName: basicBeginnerProgram.name,
  day: 1,
  dayName: "Workout A",
  entries: [],
  startTime: now - 60_000,
  endTime: now,
  id: now,
};

storage.settings.nickname = "Milestone Four Source";
storage.programs = [basicBeginnerProgram];
storage.currentProgramId = basicBeginnerProgram.id;
storage.history = [history];

const validated = Storage_get(storage, true);
if (!validated.success) {
  throw new Error(validated.error.join("\n"));
}

process.stdout.write(JSON.stringify(validated.data));
