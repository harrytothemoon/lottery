import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const ROW_HEIGHT = 45;

const ParticipantsList = React.memo(({ participants = {} }) => {
  // 將參與者數據轉換為扁平數組格式
  const flattenedParticipants = useMemo(() => {
    return Object.entries(participants).flatMap(([username, tickets]) =>
      tickets.map(ticket => ({
        username,
        numbers: ticket.join(', '),
      }))
    );
  }, [participants]);

  const Row = React.memo(({ index, style }) => {
    const participant = flattenedParticipants[index];

    return (
      <div style={style}>
        <TableRow className="hover:bg-white/5 flex">
          <TableCell className="font-bold text-lg py-2 w-[30%]">
            {maskUsername(participant.username)}
          </TableCell>
          <TableCell className="font-bold text-lg py-2 w-[70%]">
            {participant.numbers}
          </TableCell>
        </TableRow>
      </div>
    );
  });

  const TableWithVirtualization = () => (
    <Card className="flex-1 bg-transparent">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-10 h-10 text-white-300" />
          <div>
            <h3 className="text-[40px] font-bold text-yellow-300">
              Participants List
            </h3>
            <div className="text-xl text-muted-foreground font-bold">
              Total:{' '}
              {new Intl.NumberFormat().format(flattenedParticipants.length)}{' '}
              tickets
            </div>
          </div>
        </div>

        <div className="rounded-lg border flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-transparent z-10">
              <TableRow>
                <TableHead className="text-lg font-bold w-[30%]">
                  Username
                </TableHead>
                <TableHead className="text-lg font-bold w-[70%]">
                  Numbers
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <div style={{ flex: '1', height: '530px' }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={flattenedParticipants.length}
                  itemSize={ROW_HEIGHT}
                  width={width}
                  overscanCount={5}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return <TableWithVirtualization />;
});

const maskUsername = username => {
  if (!username || username.length <= 3) return username;
  return `${username.slice(0, 2)}${'*'.repeat(
    username.length - 3
  )}${username.slice(-1)}`;
};

export default ParticipantsList;
