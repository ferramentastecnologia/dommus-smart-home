import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { AgentPerformance } from '@/types/AgentPerformance';

interface AgentPerformanceTableProps {
  data: AgentPerformance[];
}

export const AgentPerformanceTable = ({ data }: AgentPerformanceTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Agent</TableCell>
            <TableCell align="right">Total Leads</TableCell>
            <TableCell align="right">Won</TableCell>
            <TableCell align="right">Lost</TableCell>
            <TableCell align="right">Conversion Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell component="th" scope="row">
                {agent.name}
              </TableCell>
              <TableCell align="right">{agent.totalLeads}</TableCell>
              <TableCell align="right">{agent.closedWon}</TableCell>
              <TableCell align="right">{agent.closedLost}</TableCell>
              <TableCell align="right">{agent.conversionRate.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 