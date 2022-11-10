import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser, Public } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookService } from './book.service';
import {
  CreateBookDto,
  EditBookDto,
  PaginateDto,
  PaginateParamDto,
} from './dto';

import {
  availableBooks,
  booksBorrowedFromMe,
  myBorrows,
  validateId,
} from './helper';

@UseGuards(JwtGuard)
@Controller('books')
export class BookController {
  constructor(private bookService: BookService) {}

  @Public()
  @Get('')
  getBooks() {
    return this.bookService.getBooks();
  }

  @Get('filterBy')
  filterBooks(@Query('filter') filterDto: any, @Query('value') valueDto: any) {
    return this.bookService.filterBooks(filterDto, valueDto);
  }

  @Get('details/:bookId')
  getDetails(@Param('bookId', ParseIntPipe) bookId: number) {
    validateId(bookId);
    return this.bookService.getDetails(bookId);
  }

  @Get('me')
  getMyBooks(@GetUser('id') userId: number) {
    return this.bookService.getMyBooks(userId);
  }

  @Get('me/amounts')
  getMyBooksAmounts(@GetUser('id') userId: number) {
    return this.bookService.getMyBooksAmounts(userId);
  }

  @Get('me/paginate/:type')
  async getMyBooksPaginate(
    @GetUser('id') userId: number,
    @Query() paginate: PaginateDto,
    @Param() type: PaginateParamDto,
  ) {
    const getAmounts = await this.bookService.getMyBooksAmounts(userId);
    if (type.type === 'availableBooks') {
      const bookType = availableBooks(userId);
      const amount = getAmounts.amounts.availableBooks;
      return this.bookService.getMyBooksPaginate(
        bookType,
        amount,
        paginate.take,
        paginate.cursor,
        paginate.booksLeftToTake,
      );
    }
    if (type.type === 'booksBorrowedFromMe') {
      const bookType = booksBorrowedFromMe(userId);
      const amount = getAmounts.amounts.booksBorrowedFromMe;
      return this.bookService.getMyBooksPaginate(
        bookType,
        amount,
        paginate.take,
        paginate.cursor,
        paginate.booksLeftToTake,
      );
    }
    if (type.type === 'myBorrows') {
      const bookType = myBorrows(userId);
      const amount = getAmounts.amounts.myBorrows;
      return this.bookService.getMyBooksPaginate(
        bookType,
        amount,
        paginate.take,
        paginate.cursor,
        paginate.booksLeftToTake,
      );
    }
    throw new ForbiddenException('Book Type Not Found');
  }

  @Post('me')
  createBook(@Body() bookDto: CreateBookDto, @GetUser('id') userId: number) {
    return this.bookService.createBook(bookDto, userId);
  }

  @Patch('me/:bookId')
  patchBook(
    @Body() bookDto: EditBookDto,
    @Param('bookId', ParseIntPipe) bookId: number,
    @GetUser('id') userId: number,
  ) {
    validateId(bookId);
    return this.bookService.patchBook(bookDto, bookId, userId);
  }

  @Delete('me/:bookId')
  deleteBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @GetUser('id') userId: number,
  ) {
    validateId(bookId);
    return this.bookService.deleteBook(bookId, userId);
  }
}
