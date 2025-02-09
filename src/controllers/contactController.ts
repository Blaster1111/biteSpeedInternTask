import { Request, Response } from "express";
import prisma from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Contact } from "@prisma/client";

export const identifyContact = asyncHandler(async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    throw new ApiError(400, "Either email or phoneNumber is required");
  }

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: { not: null, equals: email } },
        { phoneNumber: { not: null, equals: phoneNumber } },
      ],
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (contacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: { 
        email, 
        phoneNumber, 
        linkPrecedence: "primary" 
      },
    });
    return res.json(new ApiResponse(200, generateContactResponse(newContact)));
  }

  let primaryContact = contacts.find(c => c.linkPrecedence === "primary" && !c.linkedId);
  
  if (contacts.filter(c => c.linkPrecedence === "primary" && !c.linkedId).length > 1) {
    primaryContact = contacts
      .filter(c => c.linkPrecedence === "primary" && !c.linkedId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    await prisma.contact.updateMany({
      where: {
        id: {
          in: contacts
            .filter(c => c.linkPrecedence === "primary" && c.id !== primaryContact!.id)
            .map(c => c.id)
        }
      },
      data: {
        linkPrecedence: "secondary",
        linkedId: primaryContact!.id
      }
    });
  }

  const emails = new Set<string>();
  const phoneNumbers = new Set<string>();
  const secondaryContactIds = new Set<number>();

  contacts.forEach(contact => {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    if (contact.id !== primaryContact!.id) secondaryContactIds.add(contact.id);
  });

  if ((email && !emails.has(email)) || (phoneNumber && !phoneNumbers.has(phoneNumber))) {
    const newSecondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact!.id,
        linkPrecedence: "secondary",
      },
    });
    secondaryContactIds.add(newSecondary.id);
    if (email) emails.add(email);
    if (phoneNumber) phoneNumbers.add(phoneNumber);
  }

  const emailsArray = Array.from(emails);
  const phoneNumbersArray = Array.from(phoneNumbers);
  if (primaryContact!.email) {
    emailsArray.splice(emailsArray.indexOf(primaryContact!.email), 1);
    emailsArray.unshift(primaryContact!.email);
  }
  if (primaryContact!.phoneNumber) {
    phoneNumbersArray.splice(phoneNumbersArray.indexOf(primaryContact!.phoneNumber), 1);
    phoneNumbersArray.unshift(primaryContact!.phoneNumber);
  }

  return res.json(
    new ApiResponse(200, {
      contact: {
        primaryContatctId: primaryContact!.id,
        emails: emailsArray,
        phoneNumbers: phoneNumbersArray,
        secondaryContactIds: Array.from(secondaryContactIds),
      },
    })
  );
});


export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const { email, phoneNumber, linkedId, linkPrecedence } = req.body;

  if (!email && !phoneNumber) {
    throw new ApiError(400, "Either email or phoneNumber is required");
  }

  if (linkedId) {
    const linkedContact = await prisma.contact.findUnique({
      where: { id: linkedId }
    });
    if (!linkedContact) {
      throw new ApiError(400, "Linked contact not found");
    }
  }

  const newContact = await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkedId,
      linkPrecedence: linkPrecedence || "primary"
    }
  });

  return res.status(201).json(
    new ApiResponse(201, {
      contact: newContact
    })
  );
});



export const generateContactResponse = (primaryContact: Contact) => {
  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails: primaryContact.email ? [primaryContact.email] : [],
      phoneNumbers: primaryContact.phoneNumber ? [primaryContact.phoneNumber] : [],
      secondaryContactIds: [],
    },
  };
};
