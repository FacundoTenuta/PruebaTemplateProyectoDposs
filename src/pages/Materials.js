import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import moment from 'moment';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress
} from '@mui/material';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../sections/@dashboard/user';
//
import MATERIALES from '../_mocks_/materiales.json';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nombre', label: 'Nombre', alignRight: false },
  { id: 'unidad_medida', label: 'Medida', alignRight: false },
  { id: 'costo_unitario', label: 'Costo Unit', alignRight: false },
  { id: 'perdida', label: 'Perdida', alignRight: false },
  { id: 'transporte', label: 'Transporte', alignRight: false },
  { id: 'costo_unitario_final', label: 'Costo Unit Final', alignRight: false },
  { id: 'fecha', label: 'Fecha', alignRight: false }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_material) => _material.nombre.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Material() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [materiales, setMateriales] = useState(MATERIALES);

  const [loading, setLoading] = useState(false);

  const [distanceBottom, setDistanceBottom] = useState(0);

  const tablaRef = useRef();

  const [hasMore] = useState(true);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

/*   const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = materiales.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }; */

 /*  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  }; */

/*   const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }; */

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - materiales.length) : 0;

  const filteredMaterials = applySortFilter(materiales, getComparator(order, orderBy), filterName);

  const isMaterialNotFound = filteredMaterials.length === 0;

  const formatoMoneda = (dato) => Intl.NumberFormat('es-AR', {currency: 'ARS', style: 'currency'}).format(dato);

  const formatoPorcentaje = (dato) => `${dato}%`;

  const formatoFecha = (dato) => moment(dato).format("DD/MM/YYYY");

  const loadMore = useCallback(() => {
    const loadItems = async () => {
      await new Promise(resolve =>
        setTimeout(() => {
          setMateriales(materiales.concat(MATERIALES))
          setLoading(false)
        }, 2000)
      )
    }
    setLoading(true)
    loadItems()
  }, [materiales]);

  const scrollListener = useCallback(() => {
    const bottom = tablaRef.current.scrollHeight - tablaRef.current.clientHeight

    console.log('scrollListener -->', bottom);
    // if you want to change distanceBottom every time new data is loaded
    // don't use the if statement
    if (!distanceBottom) {
      // calculate distanceBottom that works for you
      setDistanceBottom(Math.round((bottom / 100) * 20))
    }
    if (tablaRef.current.scrollTop > bottom - distanceBottom && hasMore && !loading) {
      loadMore()
    }
  }, [hasMore, loadMore, loading, distanceBottom]);

  console.log(tablaRef.current);

  useLayoutEffect(() => {
    console.log("asdasd");
    const ref = tablaRef.current
    ref.addEventListener('scroll', scrollListener)
    return () => {
      ref.removeEventListener('scroll', scrollListener)
    }
  }, [scrollListener]);

  return (
    <Page title="Materiales">
      <Container >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Materiales
          </Typography>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            />

          <Scrollbar>
            <TableContainer sx={{height:'60vh'}} ref={tablaRef}>
              <Table stickyHeader >
                {/* <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={materiales.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                /> */}
                <TableBody>
                  {materiales
                    /* .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) */
                    .map((row, index) => {
                      const {
                        nombre,
                        unidad_medida,
                        costo_unitario,
                        perdida,
                        transporte,
                        costo_unitario_final,
                        fecha
                      } = row;

                      return (
                        <TableRow
                          hover
                          key={index}
                          tabIndex={-1}
                          role="checkbox"
                        >
                          {/* <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, name)}
                            />
                          </TableCell> */}
                          <TableCell align="left">{nombre}</TableCell>
                          <TableCell align="left">{unidad_medida}</TableCell>
                          <TableCell align="left">{formatoMoneda(costo_unitario)}</TableCell>
                          <TableCell align="left">{formatoPorcentaje(perdida)}</TableCell>
                          <TableCell align="left">{transporte}</TableCell>
                          <TableCell align="left">{formatoMoneda(costo_unitario_final)}</TableCell>
                          <TableCell align="left">{formatoFecha(fecha)}</TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isMaterialNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                {loading && <CircularProgress />}
              </Table>
            </TableContainer>
          </Scrollbar>

          {/* <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          /> */}
        </Card>
      </Container>
    </Page>
  );
}
