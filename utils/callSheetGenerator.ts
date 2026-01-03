import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Shoot } from '../types';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Generate and download Call Sheet PDF for a shoot
 */
export const generateCallSheetPDF = (shoot: Shoot): void => {
  // Format date nicely
  const formattedDate = new Date(shoot.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build PDF document definition
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    header: {
      margin: [40, 20, 40, 0],
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: 'CALL SHEET',
              style: 'header',
              alignment: 'center',
              border: [false, false, false, true],
              borderColor: ['#000000', '#000000', '#000000', '#000000']
            }
          ]
        ]
      }
    },

    content: [
      // Project Info
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'PROJECT:', style: 'label' },
              { text: shoot.title, style: 'value', bold: true }
            ],
            [
              { text: 'CLIENT:', style: 'label' },
              { text: shoot.client, style: 'value' }
            ],
            [
              { text: 'DATE:', style: 'label' },
              { text: formattedDate, style: 'value' }
            ],
            [
              { text: 'HOURS:', style: 'label' },
              { text: `${shoot.startTime} - ${shoot.endTime}`, style: 'value' }
            ],
            ...(shoot.projectType ? [
              [
                { text: 'TYPE:', style: 'label' },
                {
                  text: shoot.projectType === 'photo_shoot' ? 'Photo Shoot' :
                        shoot.projectType === 'video_project' ? 'Video Project' :
                        'Hybrid (Photo + Video)',
                  style: 'value'
                }
              ]
            ] : [])
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },

      // Description
      ...(shoot.description ? [
        { text: 'OVERVIEW', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        { text: shoot.description, style: 'bodyText', margin: [0, 0, 0, 20] }
      ] : []),

      // Location
      ...(shoot.locationName || shoot.locationAddress ? [
        { text: 'LOCATION', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['*'],
            body: [
              [{ text: shoot.locationName || 'TBD', bold: true, fontSize: 11 }],
              ...(shoot.locationAddress ? [[{ text: shoot.locationAddress, fontSize: 9 }]] : []),
              ...(shoot.locationMapUrl ? [[
                {
                  text: shoot.locationMapUrl,
                  link: shoot.locationMapUrl,
                  color: '#0000EE',
                  decoration: 'underline',
                  fontSize: 8
                }
              ]] : [])
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20]
        }
      ] : []),

      // Timeline/Schedule
      ...(shoot.timeline && shoot.timeline.length > 0 ? [
        { text: 'SCHEDULE', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: [60, '*'],
            headerRows: 0,
            body: shoot.timeline.map(event => [
              { text: event.time, bold: true, fontSize: 10 },
              { text: event.activity, fontSize: 10 }
            ])
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#CCCCCC',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 3,
            paddingBottom: () => 3
          },
          margin: [0, 0, 0, 20]
        }
      ] : []),

      // Crew/Team
      ...(shoot.team && shoot.team.length > 0 ? [
        { text: 'CREW', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: [100, '*', 80],
            headerRows: 1,
            body: [
              [
                { text: 'ROLE', style: 'tableHeader' },
                { text: 'NAME', style: 'tableHeader' },
                { text: 'CONTACT', style: 'tableHeader' }
              ],
              ...shoot.team.map(member => [
                { text: member.role, fontSize: 9 },
                { text: member.name, fontSize: 9, bold: true },
                {
                  text: member.phone || member.email || '-',
                  fontSize: 8,
                  color: '#666666'
                }
              ])
            ]
          },
          layout: {
            hLineWidth: (i: number) => i === 1 ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#CCCCCC',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
          },
          margin: [0, 0, 0, 20]
        }
      ] : []),

      // Talent
      ...(shoot.talent && shoot.talent.length > 0 ? [
        { text: 'TALENT', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          table: {
            widths: [80, '*', 60, 60],
            headerRows: 1,
            body: [
              [
                { text: 'NAME', style: 'tableHeader' },
                { text: 'ROLE', style: 'tableHeader' },
                { text: 'ARRIVAL', style: 'tableHeader' },
                { text: 'SIZES', style: 'tableHeader' }
              ],
              ...shoot.talent.map(member => [
                { text: member.name, fontSize: 9, bold: true },
                { text: member.role || '-', fontSize: 9 },
                { text: member.arrivalTime || '-', fontSize: 8 },
                {
                  text: member.sizes ?
                    [
                      member.sizes.height,
                      member.sizes.clothing,
                      member.sizes.shoes
                    ].filter(Boolean).join(' / ') : '-',
                  fontSize: 7
                }
              ])
            ]
          },
          layout: {
            hLineWidth: (i: number) => i === 1 ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#CCCCCC',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
          },
          margin: [0, 0, 0, 10]
        },
        // Talent contact details
        {
          table: {
            widths: [80, '*'],
            body: shoot.talent
              .filter(member => member.phone || member.email || member.notes)
              .map(member => [
                { text: member.name, fontSize: 8, bold: true },
                {
                  stack: [
                    ...(member.phone ? [{ text: `📱 ${member.phone}`, fontSize: 7 }] : []),
                    ...(member.email ? [{ text: `✉️ ${member.email}`, fontSize: 7 }] : []),
                    ...(member.notes ? [{ text: `📝 ${member.notes}`, fontSize: 7, italics: true, color: '#666666' }] : [])
                  ]
                }
              ])
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 20]
        }
      ] : []),

      // Notes sections
      ...(shoot.stylingNotes || shoot.hairMakeupNotes ? [
        { text: 'NOTES', style: 'sectionHeader', margin: [0, 10, 0, 5] }
      ] : []),

      ...(shoot.stylingNotes ? [
        { text: 'Styling', bold: true, fontSize: 10, margin: [0, 5, 0, 2] },
        { text: shoot.stylingNotes, fontSize: 9, margin: [0, 0, 0, 10] }
      ] : []),

      ...(shoot.hairMakeupNotes ? [
        { text: 'Hair & Makeup', bold: true, fontSize: 10, margin: [0, 5, 0, 2] },
        { text: shoot.hairMakeupNotes, fontSize: 9, margin: [0, 0, 0, 10] }
      ] : [])
    ],

    footer: (currentPage: number, pageCount: number) => {
      return {
        margin: [40, 10, 40, 0],
        columns: [
          {
            text: `Generated by Clixy • ${new Date().toLocaleDateString()}`,
            fontSize: 7,
            color: '#999999',
            alignment: 'left'
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            fontSize: 7,
            color: '#999999',
            alignment: 'right'
          }
        ]
      };
    },

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#000000',
        fillColor: '#F0F0F0',
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        fontSize: 8,
        bold: true,
        fillColor: '#E0E0E0',
        alignment: 'left'
      },
      label: {
        fontSize: 9,
        bold: true,
        margin: [0, 2, 10, 2]
      },
      value: {
        fontSize: 10,
        margin: [0, 2, 0, 2]
      },
      bodyText: {
        fontSize: 10,
        lineHeight: 1.3
      }
    },

    defaultStyle: {
      font: 'Helvetica'
    }
  };

  // Generate filename
  const filename = `CallSheet_${shoot.title.replace(/[^a-zA-Z0-9]/g, '_')}_${shoot.date}.pdf`;

  // Create and download PDF
  pdfMake.createPdf(docDefinition).download(filename);
};
